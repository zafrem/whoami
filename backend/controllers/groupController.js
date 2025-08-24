const { Group, User, GroupComment } = require('../models');
const { Op, col } = require('sequelize');
const llmService = require('../services/llmService');

const groupController = {
  async createGroup(req, res) {
    try {
      const { name, description, maxParticipants, matchingType, isPublic, publicScope, retentionHours } = req.body;
      
      if (!name || !matchingType) {
        return res.status(400).json({
          error: 'Name and matching type are required'
        });
      }

      // Validate participant limits based on matching type
      if (matchingType === '1:1') {
        if (maxParticipants && maxParticipants !== 2) {
          return res.status(400).json({
            error: '1:1 matching requires exactly 2 participants'
          });
        }
      } else if (matchingType === '1:N') {
        if (maxParticipants && (maxParticipants < 3 || maxParticipants > 20)) {
          return res.status(400).json({
            error: '1:N matching requires between 3 and 20 participants'
          });
        }
      } else {
        return res.status(400).json({
          error: 'Invalid matching type. Must be "1:1" or "1:N"'
        });
      }

      // Set default maxParticipants based on matching type
      const defaultMaxParticipants = matchingType === '1:1' ? 2 : 10;

      // Validate public scope if provided
      let validatedPublicScope = null;
      if (isPublic && publicScope) {
        validatedPublicScope = {
          countries: Array.isArray(publicScope.countries) ? publicScope.countries : [],
          minAge: publicScope.minAge && !isNaN(publicScope.minAge) ? parseInt(publicScope.minAge) : null,
          maxAge: publicScope.maxAge && !isNaN(publicScope.maxAge) ? parseInt(publicScope.maxAge) : null,
          regions: Array.isArray(publicScope.regions) ? publicScope.regions : []
        };

        // Validate age range
        if (validatedPublicScope.minAge && (validatedPublicScope.minAge < 13 || validatedPublicScope.minAge > 100)) {
          return res.status(400).json({
            error: 'Minimum age must be between 13 and 100'
          });
        }
        if (validatedPublicScope.maxAge && (validatedPublicScope.maxAge < 13 || validatedPublicScope.maxAge > 100)) {
          return res.status(400).json({
            error: 'Maximum age must be between 13 and 100'
          });
        }
        if (validatedPublicScope.minAge && validatedPublicScope.maxAge && validatedPublicScope.minAge > validatedPublicScope.maxAge) {
          return res.status(400).json({
            error: 'Minimum age cannot be greater than maximum age'
          });
        }
      }
      
      // Validate retention hours if provided
      if (retentionHours && (retentionHours < 1 || retentionHours > 336)) {
        return res.status(400).json({
          error: 'Retention hours must be between 1 and 336 (2 weeks maximum)'
        });
      }

      const group = await Group.create({
        name,
        description,
        maxParticipants: maxParticipants || defaultMaxParticipants,
        matchingType,
        createdBy: req.user.id,
        currentParticipants: 1,
        isPublic: isPublic || false,
        publicScope: validatedPublicScope,
        retentionHours: retentionHours || null
      });

      await group.addMember(req.user.id);

      res.status(201).json({
        message: 'Group created successfully',
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          maxParticipants: group.maxParticipants,
          currentParticipants: group.currentParticipants,
          matchingType: group.matchingType,
          isPublic: group.isPublic,
          publicScope: group.publicScope,
          retentionHours: group.retentionHours,
          expiresAt: group.expiresAt,
          createdAt: group.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        error: 'Failed to create group'
      });
    }
  },

  async getGroups(req, res) {
    try {
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      // Get user info for public scope filtering
      let userCountry = null;
      let userAge = null;
      let userRegion = null;

      if (req.user) {
        // Get user's current login location
        if (req.user.lastLoginLocation) {
          userCountry = req.user.lastLoginLocation.country;
          userRegion = req.user.lastLoginLocation.city;
        }
        
        // Calculate user's age
        if (req.user.birthYear) {
          userAge = new Date().getFullYear() - req.user.birthYear;
        }
      }

      // For now, show all groups and handle filtering in application logic
      // Later we can optimize with more sophisticated database queries
      const whereConditions = {
        isActive: true
      };

      const groups = await Group.findAndCountAll({
        where: whereConditions,
        attributes: [
          'id', 'name', 'description', 'maxParticipants', 
          'currentParticipants', 'matchingType', 'createdAt',
          'isPublic', 'publicScope', 'retentionHours', 'expiresAt', 'createdBy'
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Filter groups based on retention time and user access, then by public scope
      const filteredGroups = groups.rows.filter(group => {
        // First check if user can access this group based on retention time
        if (!group.canUserAccess(req.user?.id)) {
          return false;
        }
        // Always show private groups
        if (!group.isPublic) {
          return true;
        }

        // Show public groups without scope restrictions
        if (!group.publicScope || Object.keys(group.publicScope).length === 0) {
          return true;
        }

        // For authenticated users, check public scope criteria
        if (!req.user) {
          return true; // Show all public groups to unauthenticated users
        }

        const scope = group.publicScope;
        let matches = true;

        // Check country criteria
        if (scope.countries && scope.countries.length > 0 && userCountry) {
          matches = matches && scope.countries.includes(userCountry);
        }

        // Check age criteria
        if (userAge) {
          if (scope.minAge && userAge < scope.minAge) {
            matches = false;
          }
          if (scope.maxAge && userAge > scope.maxAge) {
            matches = false;
          }
        }

        // Check region criteria
        if (scope.regions && scope.regions.length > 0 && userRegion) {
          matches = matches && scope.regions.includes(userRegion);
        }

        return matches;
      });

      res.json({
        groups: filteredGroups,
        pagination: {
          total: filteredGroups.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredGroups.length / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({
        error: 'Failed to fetch groups'
      });
    }
  },

  async getGroup(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id, {
        attributes: [
          'id', 'name', 'description', 'maxParticipants', 
          'currentParticipants', 'matchingType', 'createdAt'
        ],
        include: [{
          model: User,
          as: 'members',
          attributes: ['userHash'],
          through: { attributes: [] }
        }]
      });

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      const memberHashes = group.members.map(member => member.userHash);

      res.json({
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          maxParticipants: group.maxParticipants,
          currentParticipants: group.currentParticipants,
          matchingType: group.matchingType,
          createdAt: group.createdAt,
          memberHashes
        }
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({
        error: 'Failed to fetch group'
      });
    }
  },

  async joinGroup(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id);

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      if (!group.isActive) {
        return res.status(400).json({
          error: 'Group is no longer active'
        });
      }

      if (group.currentParticipants >= group.maxParticipants) {
        return res.status(400).json({
          error: 'Group is full'
        });
      }

      const existingMember = await group.hasMembers([req.user.id]);
      if (existingMember) {
        return res.status(400).json({
          error: 'You are already a member of this group'
        });
      }

      await group.addMember(req.user.id);
      await group.increment('currentParticipants');

      res.json({
        message: 'Successfully joined group',
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          maxParticipants: group.maxParticipants,
          currentParticipants: group.currentParticipants + 1,
          matchingType: group.matchingType
        }
      });
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({
        error: 'Failed to join group'
      });
    }
  },

  async leaveGroup(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id);

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      const isMember = await group.hasMembers([req.user.id]);
      if (!isMember) {
        return res.status(400).json({
          error: 'You are not a member of this group'
        });
      }

      await group.removeMember(req.user.id);
      await group.decrement('currentParticipants');

      if (group.createdBy === req.user.id && group.currentParticipants === 1) {
        await group.update({ isActive: false });
      }

      res.json({
        message: 'Successfully left group'
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({
        error: 'Failed to leave group'
      });
    }
  },

  async getMatchingInfo(req, res) {
    try {
      const matchingInfo = {
        '1:1': {
          title: 'One-to-One Matching',
          pros: [
            'Direct comparison between two individuals',
            'Clear compatibility assessment',
            'Focused analysis of shared traits',
            'Simpler interpretation of results',
            'Ideal for partnerships or paired activities'
          ],
          cons: [
            'Limited to single comparison',
            'May miss group dynamics',
            'No insight into broader compatibility patterns',
            'Less useful for team formation'
          ],
          bestFor: [
            'Dating and relationship matching',
            'Business partnerships',
            'Mentorship pairing',
            'Study buddy assignments'
          ]
        },
        '1:N': {
          title: 'One-to-Many Matching',
          pros: [
            'Comprehensive analysis across multiple people',
            'Identifies best matches from larger pool',
            'Reveals group dynamics and interactions',
            'Better for team composition',
            'Shows compatibility spectrum'
          ],
          cons: [
            'More complex analysis required',
            'Can be overwhelming with too many options',
            'May dilute focus on individual connections',
            'Requires more computational resources'
          ],
          bestFor: [
            'Team building and formation',
            'Group activities and clubs',
            'Networking events',
            'Educational group assignments',
            'Social circles expansion'
          ]
        }
      };

      res.json(matchingInfo);
    } catch (error) {
      console.error('Error fetching matching info:', error);
      res.status(500).json({
        error: 'Failed to fetch matching information'
      });
    }
  },

  async getUserGroups(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Group,
          as: 'joinedGroups',
          where: { isActive: true },
          required: false,
          attributes: [
            'id', 'name', 'description', 'maxParticipants', 
            'currentParticipants', 'matchingType', 'createdAt'
          ],
          through: { attributes: [] }
        }]
      });

      res.json({
        groups: user.joinedGroups || []
      });
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({
        error: 'Failed to fetch user groups'
      });
    }
  },

  // New LLM-powered matching functionality
  async performGroupMatching(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id, {
        include: [{
          model: User,
          as: 'members',
          attributes: ['id', 'userHash']
        }]
      });

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      // Check if user is a member or creator
      const isMemberOrCreator = group.createdBy === req.user.id || 
        await group.hasMembers([req.user.id]);
      
      if (!isMemberOrCreator) {
        return res.status(403).json({
          error: 'Only group members can request matching analysis'
        });
      }

      // Need at least 2 members for matching
      if (group.members.length < 2) {
        return res.status(400).json({
          error: 'Group needs at least 2 members for matching analysis'
        });
      }

      // Extract user hashes for LLM analysis
      const userHashes = group.members.map(member => member.userHash).filter(hash => hash);

      if (userHashes.length < 2) {
        return res.status(400).json({
          error: 'Not enough members with complete profiles for analysis'
        });
      }

      // Perform LLM-powered matching analysis
      const matchingResult = await llmService.performMatching(
        userHashes,
        group.matchingType,
        group.id,
        req.user.id
      );

      res.json({
        message: 'Matching analysis completed successfully',
        group: {
          id: group.id,
          name: group.name,
          matchingType: group.matchingType,
          memberCount: group.members.length
        },
        analysis: matchingResult.analysis,
        logId: matchingResult.logId,
        processingTime: matchingResult.processingTime
      });

    } catch (error) {
      console.error('Error performing group matching:', error);
      res.status(500).json({
        error: 'Failed to perform matching analysis: ' + error.message
      });
    }
  },

  // Get matching results for a group
  async getGroupMatchingHistory(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      // Check if user is a member or creator
      const isMemberOrCreator = group.createdBy === req.user.id || 
        await group.hasMembers([req.user.id]);
      
      if (!isMemberOrCreator) {
        return res.status(403).json({
          error: 'Only group members can view matching history'
        });
      }

      const matchingHistory = await llmService.getLogs(50, 0, {
        groupId: id,
        operation: 'matching_analysis'
      });

      res.json({
        group: {
          id: group.id,
          name: group.name
        },
        history: matchingHistory.rows,
        total: matchingHistory.count
      });

    } catch (error) {
      console.error('Error getting matching history:', error);
      res.status(500).json({
        error: 'Failed to get matching history'
      });
    }
  },

  // Delete group - Admin only functionality
  async deleteGroup(req, res) {
    try {
      const { id } = req.params;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Only administrators can delete groups'
        });
      }

      const group = await Group.findByPk(id);

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      // Log the group deletion for audit purposes
      console.log(`Admin ${req.user.username} (${req.user.id}) deleting group "${group.name}" (${group.id})`);

      // Delete the group (cascade will handle group members)
      await group.destroy();

      res.json({
        message: 'Group deleted successfully',
        deletedGroup: {
          id: group.id,
          name: group.name,
          matchingType: group.matchingType,
          maxParticipants: group.maxParticipants
        }
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({
        error: 'Failed to delete group'
      });
    }
  },

  // Group Comments (for expired groups)
  async getGroupComments(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Check if user can access this group
      if (!group.canUserAccess(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const comments = await GroupComment.findAll({
        where: { groupId: id, isVisible: true },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ comments });
    } catch (error) {
      console.error('Error fetching group comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  },

  async addGroupComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Check if user can access this group
      if (!group.canUserAccess(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only allow comments on expired groups created by the user
      if (!group.isExpired() || group.createdBy !== req.user.id) {
        return res.status(403).json({ 
          error: 'Comments can only be added to expired groups by their creator' 
        });
      }

      const comment = await GroupComment.create({
        groupId: id,
        userId: req.user.id,
        content: content.trim()
      });

      const commentWithAuthor = await GroupComment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      res.status(201).json({ 
        message: 'Comment added successfully',
        comment: commentWithAuthor 
      });
    } catch (error) {
      console.error('Error adding group comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  },

  async deleteGroupComment(req, res) {
    try {
      const { commentId } = req.params;

      const comment = await GroupComment.findByPk(commentId, {
        include: [{
          model: Group,
          as: 'group'
        }]
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Only the comment author or group creator can delete comments
      if (comment.userId !== req.user.id && comment.group.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await comment.destroy();

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting group comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
};

module.exports = groupController;