const { Group, User } = require('../models');
const { Op, col } = require('sequelize');

const groupController = {
  async createGroup(req, res) {
    try {
      const { name, description, maxParticipants, matchingType } = req.body;
      
      if (!name || !matchingType) {
        return res.status(400).json({
          error: 'Name and matching type are required'
        });
      }

      if (maxParticipants && (maxParticipants < 2 || maxParticipants > 20)) {
        return res.status(400).json({
          error: 'Max participants must be between 2 and 20'
        });
      }

      const group = await Group.create({
        name,
        description,
        maxParticipants: maxParticipants || 20,
        matchingType,
        createdBy: req.user.id,
        currentParticipants: 1
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

      const groups = await Group.findAndCountAll({
        where: {
          isActive: true
        },
        attributes: [
          'id', 'name', 'description', 'maxParticipants', 
          'currentParticipants', 'matchingType', 'createdAt'
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        groups: groups.rows,
        pagination: {
          total: groups.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(groups.count / limit)
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
  }
};

module.exports = groupController;