# Admin Guide - Whoami Personality Survey Platform

This comprehensive guide covers all administrative features and management capabilities of the Whoami Personality Survey Platform.

## 🔐 Admin Access

### Prerequisites

- **Admin Role**: Your user account must have admin privileges
- **Authentication**: Must be logged in with admin credentials
- **Browser**: Modern browser with JavaScript enabled

### Accessing Admin Dashboard

1. **Login**: Sign in with your admin account
2. **Navigate**: Admin dashboard is accessible via direct URL or navigation menu
3. **Verification**: System automatically verifies admin role on access

### Admin Permissions

Administrators have access to:
- ✅ **User Management**: Create, modify, and deactivate user accounts
- ✅ **Survey Management**: Create, edit, and delete surveys
- ✅ **Group Oversight**: View and manage all groups
- ✅ **LLM Configuration**: Configure AI providers and models
- ✅ **System Monitoring**: Access logs and usage analytics
- ✅ **Content Moderation**: Review and manage platform content
- ✅ **Testing & Quality**: Access to comprehensive test suites and validation
- ✅ **Security Auditing**: Review system security and access controls

---

## 📊 Dashboard Overview

### Quick Statistics

The main dashboard displays real-time platform metrics:

#### **Core Metrics**:
- **Total Users**: All registered users in the system
- **Total Surveys**: Number of available survey types
- **Active Users**: Users who can currently log in
- **Recent Activity**: Latest user registrations and survey completions

#### **System Health**:
- **Database Status**: Connection and performance metrics
- **API Status**: Service availability and response times
- **LLM Status**: AI provider connectivity and usage

### Recent Activity Feed

Monitor platform activity with:
- New user registrations
- Survey completion rates
- Group creation and activity
- System errors or issues

---

## 📋 Survey Management

### Viewing Surveys

The **Surveys** tab provides comprehensive survey oversight:

#### **Survey List Features**:
- **Name**: Localized survey titles (English/Korean)
- **Category**: Survey type (personality, political, financial, career)
- **Language**: Target language (en, ko)
- **Type**: Internal (hosted) vs External (linked)
- **Status**: Active/Inactive state
- **Actions**: Management options for each survey

### Creating Surveys

#### **Internal Surveys**

1. **Click "Add Survey"** from the Surveys tab
2. **Fill Basic Information**:
   - **Name (English)**: Primary survey title
   - **Name (Korean)**: Localized title (optional)
   - **Description (English)**: Survey overview and purpose
   - **Description (Korean)**: Localized description (optional)
   - **Category**: Select appropriate classification
   - **Language**: Primary language for the survey

3. **Configure Questions**:
   ```json
   {
     "questions": [
       {
         "id": "q1",
         "text": "Question text here",
         "type": "scale",
         "options": [
           {"value": 1, "text": "Strongly Disagree"},
           {"value": 2, "text": "Disagree"},
           {"value": 3, "text": "Neutral"},
           {"value": 4, "text": "Agree"},
           {"value": 5, "text": "Strongly Agree"}
         ]
       }
     ]
   }
   ```

4. **Configure Analysis**:
   ```json
   {
     "analysis": {
       "dimensions": ["E", "I", "N", "S", "T", "F", "J", "P"],
       "scoring": {
         "q1": {"E": 1, "I": -1}
       },
       "types": {
         "ENFP": {
           "name": "The Campaigner",
           "description": "Enthusiastic, creative and sociable free spirits...",
           "strengths": ["Creative", "Enthusiastic", "Sociable"],
           "weaknesses": ["Unfocused", "Disorganized", "Emotional"]
         }
       }
     }
   }
   ```

#### **External Surveys**

1. **Check "External Survey"** option
2. **Provide External URL**: Direct link to external survey platform
3. **Configure Basic Details**: Name, description, category
4. **Note**: Results tracking limited for external surveys

### Survey Actions

#### **Embedding Surveys**

1. **Copy Embed Link**: Direct iframe URL for embedding
2. **Copy Direct Link**: Direct survey access URL
3. **Get Embed Code**: Full HTML iframe code with customization options

**Example Embed Code**:
```html
<iframe 
  src="https://your-domain.com/embed/survey-id" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

#### **Survey Status Management**

- **Activate/Deactivate**: Control survey availability
- **Edit Content**: Modify questions and analysis
- **Delete Survey**: Permanently remove (with confirmation)

---

## 👥 User Management

### User Overview

The **Users** tab provides comprehensive user account management:

#### **User Information Displayed**:
- **Basic Info**: Username, email, registration date
- **Account Status**: Active/Inactive state
- **Role**: User vs Admin privileges
- **Type**: Free vs Pro subscription
- **Demographics**: Age (if provided)
- **Activity**: Last login time and location

### Role Management

#### **Admin vs User Roles**

**Admin Role Capabilities**:
- Access to admin dashboard
- User and survey management
- System configuration
- Content moderation
- Analytics and reporting

**User Role Capabilities**:
- Survey taking
- Result viewing
- Group participation (if Pro)
- Profile management

#### **Role Change Process**:

1. **Locate User**: Find user in the user management table
2. **Role Controls**: Use the role controls column
3. **Promote to Admin**: 
   - Click "Promote to Admin"
   - Confirm the action
   - User gains full admin privileges
4. **Demote to User**:
   - Click "Demote to User"
   - Confirm the action
   - User loses admin privileges

### Type Management (Pro/Free)

#### **Pro vs Free Features**

**Pro User Benefits**:
- ✅ Group creation and management
- ✅ Advanced group matching features
- ✅ LLM-powered compatibility analysis
- ✅ Enhanced result export options
- ✅ Priority support

**Free User Limitations**:
- ❌ No group access
- ❌ Basic matching only
- ❌ Limited export options
- ❌ Standard support

#### **Type Change Process**:

1. **Locate User**: Find user in management table
2. **Type Controls**: Use the type controls column
3. **Grant Pro Access**:
   - Click "Make Pro"
   - Confirm the promotion
   - User gains group features
4. **Remove Pro Access**:
   - Click "Remove Pro"
   - Confirm the change
   - User loses group features

### Account Status Management

#### **Account Activation/Deactivation**

**Active Accounts**:
- ✅ Can log in to platform
- ✅ Can access all features
- ✅ Can participate in surveys and groups

**Inactive Accounts**:
- ❌ Cannot log in
- ❌ Cannot access platform
- ❌ Account effectively suspended

#### **Status Change Process**:

1. **Account Controls**: Use role controls column
2. **Deactivate Account**:
   - Click "Deactivate"
   - Confirm the action
   - User cannot log in
3. **Activate Account**:
   - Click "Activate"
   - Confirm the action
   - User can log in normally

### Access Matrix

| Role + Type | Admin Access | Groups | All Features | Management |
|-------------|--------------|--------|--------------|------------|
| **Admin + Pro** | ✅ | ✅ | ✅ | ✅ |
| **Admin + Free** | ✅ | ❌ | ✅ | ✅ |
| **User + Pro** | ❌ | ✅ | ✅ | ❌ |
| **User + Free** | ❌ | ❌ | ✅ | ❌ |

---

## 🤖 LLM Configuration

### AI Provider Management

The **LLM Config** tab manages AI providers for personality analysis and group matching.

#### **Supported Providers**:

1. **Claude (Anthropic)**
   - Models: claude-3-opus, claude-3-sonnet, claude-3-haiku
   - Use case: Advanced personality analysis
   - Setup: Requires Anthropic API key

2. **Gemini (Google)**
   - Models: gemini-pro, gemini-pro-vision
   - Use case: Conversational analysis
   - Setup: Requires Google AI API key

3. **OpenAI (ChatGPT)**
   - Models: gpt-4, gpt-3.5-turbo, gpt-4-turbo
   - Use case: General purpose analysis
   - Setup: Requires OpenAI API key

4. **Ollama (Local)**
   - Models: llama2, codellama, mistral, etc.
   - Use case: Local/private deployment
   - Setup: Requires local Ollama installation

### Adding LLM Providers

1. **Click "Add LLM Provider"**
2. **Select Provider**: Choose from supported providers
3. **Configure Details**:
   - **Model**: Specific model name/version
   - **API Key**: Provider authentication (encrypted)
   - **API Endpoint**: Custom endpoint (optional for Ollama)
   - **Active**: Whether provider is available for use
   - **Default**: Primary provider for new operations

4. **Advanced Configuration** (Optional):
   ```json
   {
     "temperature": 0.7,
     "max_tokens": 4096,
     "top_p": 0.9,
     "frequency_penalty": 0.0,
     "presence_penalty": 0.0
   }
   ```

### Provider Management

#### **Provider Actions**:

- **Test**: Verify connectivity and response
- **Set/Unset Default**: Choose primary provider
- **Activate/Deactivate**: Control availability
- **Delete**: Remove provider configuration

#### **Default Provider Logic**:
- Only one provider can be default at a time
- Setting new default automatically unsets previous
- Default provider used for new group matching operations

### Security Considerations

#### **API Key Protection**:
- All API keys encrypted before database storage
- Keys never displayed in full in admin interface
- Secure key rotation supported
- Environment variable override available

---

## 📈 LLM Activity Monitoring

### Activity Logs

The **LLM Logs** tab provides comprehensive monitoring of AI interactions:

#### **Log Information**:
- **Provider**: Which AI service was used
- **Operation**: Type of analysis performed
- **Users**: Number of users involved in analysis
- **Status**: Success/failure of operation
- **Timing**: When operation occurred and duration
- **Performance**: Token usage and processing metrics

### Log Filtering

#### **Available Filters**:
- **Provider**: Filter by AI service (Claude, Gemini, OpenAI, Ollama)
- **Operation**: Filter by analysis type
  - `matching_analysis`: Group compatibility analysis
  - `compatibility_check`: Individual compatibility
  - `group_recommendation`: Team formation suggestions

### Detailed Log Analysis

#### **Log Details Include**:

**Basic Information**:
- Provider and model used
- Operation type and status
- Number of users analyzed
- Processing time and creation date

**Technical Details**:
- Full prompt sent to AI
- Complete AI response received
- Token usage statistics
- Error messages (if failed)

**Privacy Protection**:
- User identities hashed for privacy
- No personal information in logs
- Group IDs for correlation only

### Performance Monitoring

#### **Key Metrics**:
- **Response Times**: Track AI provider performance
- **Success Rates**: Monitor reliability by provider
- **Token Usage**: Cost and efficiency analysis
- **Error Patterns**: Identify common failure points

---

## 👥 Group Management

### Group Oversight

The **Groups** tab provides comprehensive group management:

#### **Group Information**:
- **Basic Details**: Name, description, creation date
- **Type**: Matching type (1:1 or group matching)
- **Participants**: Current vs maximum members
- **Creator**: Group creator username
- **Status**: Active/inactive state

### Group Actions

#### **View Details**:
1. **Click "View Details"** on any group
2. **Review Information**:
   - Complete group configuration
   - Member list (anonymized hashes)
   - Activity history
   - Matching results

#### **Delete Groups**:
1. **Click "Delete"** on target group
2. **Confirm Deletion**: Understand consequences
   - All member data removed
   - Matching history lost
   - Action cannot be undone
3. **Execute Deletion**: Permanent removal

### Group Analytics

#### **Participation Tracking**:
- Member completion rates
- Active vs inactive groups
- Growth trends over time
- Popular group types

#### **Matching Insights**:
- AI analysis success rates
- Most compatible personality combinations
- Group size optimization data
- Feature usage patterns

---

## 🛠 Platform Administration

### Content Moderation

#### **Survey Content Review**:
- Monitor user-generated survey responses
- Review flagged content for appropriateness
- Moderate group discussions and names
- Ensure platform community guidelines compliance

### Data Management

#### **Export Capabilities**:
- User data exports (GDPR compliance)
- Survey response analytics
- Group formation statistics
- Platform usage metrics

#### **Data Retention**:
- User account data retention policies
- Survey response archival
- Log retention periods
- Backup and recovery procedures

### Security Management

#### **Access Control**:
- Admin role assignment and revocation
- API key rotation and management
- Session management and timeout
- IP-based access restrictions

#### **Audit Trail**:
- Admin action logging
- User modification tracking
- System configuration changes
- Security event monitoring

#### **Testing & Quality Assurance**:
- Comprehensive unit test coverage for all API endpoints
- Frontend component testing with automated validation
- Security testing for authentication and authorization
- Performance testing for scalability
- Regular vulnerability assessments

---

## 📊 Analytics & Reporting

### User Analytics

#### **User Metrics**:
- Registration trends and patterns
- User engagement and retention
- Feature adoption rates
- Geographic distribution

#### **Survey Analytics**:
- Completion rates by survey type
- Most popular personality types
- Response patterns and trends
- Quality metrics and validation

### System Performance

#### **Technical Metrics**:
- API response times
- Database performance
- LLM provider reliability
- Error rates and patterns

#### **Usage Statistics**:
- Daily/monthly active users
- Survey completion volumes
- Group creation and participation
- Feature utilization rates

### Custom Reports

#### **Report Generation**:
- User demographic analysis
- Survey result aggregation
- Group formation success metrics
- LLM usage and cost analysis

---

## 🚨 Troubleshooting

### Common Admin Issues

#### **User Access Problems**

**Issue**: User cannot access admin features
**Solutions**:
1. Verify user has admin role assigned
2. Check if user account is active
3. Clear browser cache and cookies
4. Verify session hasn't expired

**Issue**: Admin permissions not working
**Solutions**:
1. Log out and log back in
2. Check user role in database
3. Verify JWT token validity
4. Contact system administrator

#### **Survey Management Issues**

**Issue**: Survey creation fails
**Solutions**:
1. Validate JSON syntax in questions/analysis
2. Check all required fields are filled
3. Verify survey name uniqueness
4. Review server logs for errors

**Issue**: External surveys not working
**Solutions**:
1. Verify external URL is accessible
2. Check URL format and protocol
3. Test iframe embedding compatibility
4. Confirm external service availability

#### **LLM Configuration Problems**

**Issue**: AI provider test fails
**Solutions**:
1. Verify API key is correct and active
2. Check API endpoint URL format
3. Confirm provider service is available
4. Review rate limits and usage quotas

**Issue**: Group matching not working
**Solutions**:
1. Ensure at least one LLM provider is active
2. Verify default provider is set
3. Check provider configuration settings
4. Review LLM service logs for errors

### Emergency Procedures

#### **System Recovery**:
1. **Database Issues**: Contact database administrator
2. **API Failures**: Check service status and logs
3. **Security Breach**: Immediately revoke compromised access
4. **Data Loss**: Implement backup recovery procedures

#### **User Support Escalation**:
1. **Account Lockouts**: Verify and reactivate accounts
2. **Data Recovery**: Use backup systems for restoration
3. **Privacy Concerns**: Implement immediate data protection
4. **Technical Issues**: Coordinate with development team

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

#### **Daily Tasks**:
- Review system health dashboard
- Monitor user activity and issues
- Check LLM provider status
- Review security logs
- Run critical system tests

#### **Weekly Tasks**:
- Analyze user growth and engagement
- Review survey completion metrics
- Update LLM configurations if needed
- Backup critical system data
- Execute comprehensive test suites

#### **Monthly Tasks**:
- Generate comprehensive analytics reports
- Review and update user permissions
- Audit security configurations
- Plan capacity and scaling needs
- Full system testing and validation

### Getting Help

#### **Documentation Resources**:
- API documentation for technical details
- User guide for feature explanations
- Setup guide for installation help
- System requirements for compatibility

#### **Support Channels**:
- Technical documentation and FAQs
- Development team contact information
- Community forums and discussions
- Emergency contact procedures

#### **Training Resources**:
- Admin interface video tutorials
- Best practices documentation
- Security guidelines and procedures
- Advanced feature training materials

---

**Remember**: As an administrator, you have significant power over user data and platform functionality. Always follow security best practices, document your changes, and consider the impact on users before making modifications.

**Emergency Contact**: For urgent issues requiring immediate attention, contact the development team or system administrator through established emergency procedures.