class User extends Model {
  static get tableName() {
    return 'users';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name', 'email', 'password', 'role'],
        
      properties: {
        
        id: { type: 'number'  },
        
        name: { type: 'string'  },
        
        email: { type: 'string'  },
        
        password: { type: 'string'  },
        
        role: { type: 'string'  }
      }
    };
  }
  
  static get relationMappings() {
    return {
      
      posts: {
        relation: Model.HasManyRelation,
        modelClass: require('./posts'),
        join: {
          from: 'users.id',
          to: 'posts.undefined'
        }
      },
      
      comments: {
        relation: Model.HasManyRelation,
        modelClass: require('./comments'),
        join: {
          from: 'users.id',
          to: 'comments.undefined'
        }
      }
    };
  }
}