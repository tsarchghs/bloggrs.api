
// migrations/1731333783773_create_categories_table.js
exports.up = function(knex) {
  return knex.schema.createTable('categories', table => {
    
    table.integer('id').notNullable().primary();
    
    table.text('name').notNullable().unique();
    
    table.text('slug').notNullable().unique();
    
    
    
    
  });
};