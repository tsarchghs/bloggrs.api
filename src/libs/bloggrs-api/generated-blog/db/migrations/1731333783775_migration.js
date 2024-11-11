
// migrations/1731333783772_create_posts_table.js
exports.up = function(knex) {
  return knex.schema.createTable('posts', table => {
    
    table.integer('id').notNullable().primary();
    
    table.text('title').notNullable();
    
    table.text('content').notNullable();
    
    table.boolean('published').notNullable();
    
    table.integer('user_id').notNullable();
    
    
    
    table.integer('user_id').references('id').inTable('users');
  });
};