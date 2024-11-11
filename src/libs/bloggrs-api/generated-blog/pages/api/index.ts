
import { NextApiRequest, NextApiResponse } from 'next';
import { GetApiPostsRequest, GetApiPostsResponse } from '../types/api';
import Post from '../models/Post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetApiPostsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const result = await Post.query()
      .modify(builder => {
          if (page) builder.where('page', page);
        })
      .modify(builder => {
          if (limit) builder.where('limit', limit);
        })
      .modify(builder => {
          if (categoryId) builder.where('categoryId', categoryId);
        })
      .modify(builder => {
          if (userId) builder.where('userId', userId);
        });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import { PostApiPostsRequest, PostApiPostsResponse } from '../types/api';
import Post from '../models/Post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostApiPostsResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const result = await Post.query().insert(req.body);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import { GetApiPosts{id}Request, GetApiPosts{id}Response } from '../types/api';
import Post from '../models/Post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetApiPosts{id}Response>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const result = await Post.query()
      .modify(builder => {
          if (id) builder.where('id', id);
        });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}