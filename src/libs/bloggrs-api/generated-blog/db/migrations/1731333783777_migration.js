
// migrations/1731333783773_create_comments_table.js
exports.up = function(knex) {
  return knex.schema.createTable('comments', table => {
    
    table.integer('id').notNullable().primary();
    
    table.text('content').notNullable();
    
    table.integer('user_id').notNullable();
    
    table.integer('post_id').notNullable();
    
    
    
    table.integer('user_id').references('id').inTable('users');
    table.integer('post_id').references('id').inTable('posts');
  });
};