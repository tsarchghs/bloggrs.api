exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};