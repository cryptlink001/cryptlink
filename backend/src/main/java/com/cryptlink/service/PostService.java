package com.cryptlink.service;

import com.cryptlink.model.Post;
import com.cryptlink.model.PostLike;
import com.cryptlink.model.Comment;
import com.cryptlink.model.User;
import com.cryptlink.repository.PostRepository;
import com.cryptlink.repository.PostLikeRepository;
import com.cryptlink.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Transactional
    public Post createPost(Post post) {
        post.setLikesCount(0L);
        post.setCommentsCount(0L);
        post.setSharesCount(0L);
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public Post getPostById(UUID postId) {
        return postRepository.findById(postId).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<Post> getFeedPosts(UUID userId, Pageable pageable) {
        return postRepository.findFeedPosts(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Post> getFollowingPosts(UUID userId, Pageable pageable) {
        return postRepository.findFollowingPosts(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Post> getUserPosts(UUID userId, Pageable pageable) {
        return postRepository.findUserPosts(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Post> getTrendingPosts(Pageable pageable) {
        return postRepository.findTrendingPosts(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Post> searchPosts(String query, Pageable pageable) {
        return postRepository.searchPostsByCaption(query, pageable);
    }

    @Transactional
    public void likePost(UUID postId, UUID userId) {
        Post post = getPostById(postId);
        User user = new User();
        user.setId(userId);

        if (postLikeRepository.findByPostAndUser(post, user) == null) {
            PostLike like = new PostLike(post, user);
            postLikeRepository.save(like);
            post.incrementLikes();
            postRepository.save(post);
        }
    }

    @Transactional
    public void unlikePost(UUID postId, UUID userId) {
        Post post = getPostById(postId);
        User user = new User();
        user.setId(userId);

        PostLike like = postLikeRepository.findByPostAndUser(post, user);
        if (like != null) {
            postLikeRepository.delete(like);
            post.decrementLikes();
            postRepository.save(post);
        }
    }

    @Transactional
    public Comment addComment(UUID postId, UUID userId, String content) {
        Post post = getPostById(postId);
        User user = new User();
        user.setId(userId);

        Comment comment = new Comment(post, user, content);
        comment = commentRepository.save(comment);
        
        post.incrementComments();
        postRepository.save(post);
        
        return comment;
    }

    @Transactional(readOnly = true)
    public Page<Comment> getPostComments(UUID postId, Pageable pageable) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
    }

    @Transactional
    public void deletePost(UUID postId) {
        Post post = getPostById(postId);
        if (post != null) {
            post.delete();
            postRepository.save(post);
        }
    }

    @Transactional
    public void editPost(UUID postId, String newCaption) {
        Post post = getPostById(postId);
        if (post != null) {
            post.editCaption(newCaption);
            postRepository.save(post);
        }
    }

    @Transactional
    public void sharePost(UUID postId) {
        Post post = getPostById(postId);
        if (post != null) {
            post.incrementShares();
            postRepository.save(post);
        }
    }

    @Transactional(readOnly = true)
    public boolean isPostLikedByUser(UUID postId, UUID userId) {
        Post post = getPostById(postId);
        User user = new User();
        user.setId(userId);
        return postLikeRepository.findByPostAndUser(post, user) != null;
    }
}
