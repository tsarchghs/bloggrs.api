class Categorie extends Model {
  static get tableName() {
    return 'categories';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name', 'slug'],
        
      properties: {
        
        id: { type: 'number'  },
        
        name: { type: 'string'  },
        
        slug: { type: 'string'  }
      }
    };
  }
  
  static get relationMappings() {
    return {
      
      posts: {
        relation: Model.ManyToManyRelation,
        modelClass: require('./posts'),
        join: {
          from: 'categories.id',
          to: 'posts.undefined'
        }
      }
    };
  }
}