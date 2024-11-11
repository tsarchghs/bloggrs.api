
// migrations/1731333837313_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    
    table.integer('id').notNullable().primary();
    
    table.text('name').notNullable();
    
    table.text('email').notNullable().unique();
    
    table.text('password').notNullable();
    
    table.text('role').notNullable().defaultTo("user");
    
    
    
    
  });
};