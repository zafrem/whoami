'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableDesc = await queryInterface.describeTable('Groups');
    
    if (!tableDesc.isPublic) {
      await queryInterface.addColumn('Groups', 'isPublic', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!tableDesc.publicScope) {
      await queryInterface.addColumn('Groups', 'publicScope', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Public scope criteria: { countries: [], minAge: null, maxAge: null, regions: [] }'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Groups', 'isPublic');
    await queryInterface.removeColumn('Groups', 'publicScope');
  }
};
