class Comment extends Model {
  static get tableName() {
    return 'comments';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'content', 'user_id', 'post_id'],
        
      properties: {
        
        id: { type: 'number'  },
        
        content: { type: 'string'  },
        
        user_id: { type: 'number'  },
        
        post_id: { type: 'number'  }
      }
    };
  }
  
  static get relationMappings() {
    return {
      
      author: {
        relation: Model.BelongsToRelation,
        modelClass: require('./users'),
        join: {
          from: 'comments.id',
          to: 'users.user_id'
        }
      },
      
      post: {
        relation: Model.BelongsToRelation,
        modelClass: require('./posts'),
        join: {
          from: 'comments.id',
          to: 'posts.post_id'
        }
      }
    };
  }
}