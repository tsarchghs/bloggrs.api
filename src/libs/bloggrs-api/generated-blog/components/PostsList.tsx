import React from 'react';
import PropTypes from 'prop-types';

interface PostsListProps {
  posts: any[];
}

export function PostsList({ posts }: PostsListProps) {
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

PostsList.propTypes = {
  posts: PropTypes.array.isRequired
};