
// migrations/1731333922924_create_categories_table.js
exports.up = function(knex) {
  return knex.schema.createTable('categories', table => {
    
    table.integer('id').notNullable().primary();
    
    table.text('name').notNullable().unique();
    
    table.text('slug').notNullable().unique();
    
    
    
    
  });
};