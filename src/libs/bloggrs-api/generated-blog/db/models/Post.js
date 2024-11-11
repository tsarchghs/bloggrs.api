class Post extends Model {
  static get tableName() {
    return 'posts';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'title', 'content', 'published', 'user_id'],
        
      properties: {
        
        id: { type: 'number'  },
        
        title: { type: 'string'  },
        
        content: { type: 'string'  },
        
        published: { type: 'boolean'  },
        
        user_id: { type: 'number'  }
      }
    };
  }
  
  static get relationMappings() {
    return {
      
      author: {
        relation: Model.BelongsToRelation,
        modelClass: require('./users'),
        join: {
          from: 'posts.id',
          to: 'users.user_id'
        }
      },
      
      comments: {
        relation: Model.HasManyRelation,
        modelClass: require('./comments'),
        join: {
          from: 'posts.id',
          to: 'comments.undefined'
        }
      },
      
      categories: {
        relation: Model.ManyToManyRelation,
        modelClass: require('./categories'),
        join: {
          from: 'posts.id',
          to: 'categories.undefined'
        }
      }
    };
  }
}