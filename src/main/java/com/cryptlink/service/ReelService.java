package com.cryptlink.service;

import com.cryptlink.model.Reel;
import com.cryptlink.model.ReelLike;
import com.cryptlink.model.ReelComment;
import com.cryptlink.model.User;
import com.cryptlink.repository.ReelRepository;
import com.cryptlink.repository.ReelLikeRepository;
import com.cryptlink.repository.ReelCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReelService {

    @Autowired
    private ReelRepository reelRepository;

    @Autowired
    private ReelLikeRepository reelLikeRepository;

    @Autowired
    private ReelCommentRepository reelCommentRepository;

    @Transactional
    public Reel createReel(Reel reel) {
        reel.setLikesCount(0L);
        reel.setCommentsCount(0L);
        reel.setSharesCount(0L);
        reel.setViewsCount(0L);
        return reelRepository.save(reel);
    }

    @Transactional(readOnly = true)
    public Reel getReelById(UUID reelId) {
        return reelRepository.findById(reelId).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<Reel> getFeedReels(UUID userId, Pageable pageable) {
        return reelRepository.findFeedReels(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reel> getFollowingReels(UUID userId, Pageable pageable) {
        return reelRepository.findFollowingReels(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reel> getUserReels(UUID userId, Pageable pageable) {
        return reelRepository.findUserReels(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reel> getTrendingReels(Pageable pageable) {
        return reelRepository.findTrendingReels(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reel> searchReels(String query, Pageable pageable) {
        return reelRepository.searchReelsByCaption(query, pageable);
    }

    @Transactional
    public void likeReel(UUID reelId, UUID userId) {
        Reel reel = getReelById(reelId);
        User user = new User();
        user.setId(userId);

        if (reelLikeRepository.findByReelAndUser(reel, user) == null) {
            ReelLike like = new ReelLike(reel, user);
            reelLikeRepository.save(like);
            reel.incrementLikes();
            reelRepository.save(reel);
        }
    }

    @Transactional
    public void unlikeReel(UUID reelId, UUID userId) {
        Reel reel = getReelById(reelId);
        User user = new User();
        user.setId(userId);

        ReelLike like = reelLikeRepository.findByReelAndUser(reel, user);
        if (like != null) {
            reelLikeRepository.delete(like);
            reel.decrementLikes();
            reelRepository.save(reel);
        }
    }

    @Transactional
    public ReelComment addComment(UUID reelId, UUID userId, String content) {
        Reel reel = getReelById(reelId);
        User user = new User();
        user.setId(userId);

        ReelComment comment = new ReelComment(reel, user, content);
        comment = reelCommentRepository.save(comment);
        
        reel.incrementComments();
        reelRepository.save(reel);
        
        return comment;
    }

    @Transactional(readOnly = true)
    public Page<ReelComment> getReelComments(UUID reelId, Pageable pageable) {
        return reelCommentRepository.findByReelIdOrderByCreatedAtDesc(reelId, pageable);
    }

    @Transactional
    public void viewReel(UUID reelId) {
        Reel reel = getReelById(reelId);
        if (reel != null) {
            reel.incrementViews();
            reelRepository.save(reel);
        }
    }

    @Transactional
    public void shareReel(UUID reelId) {
        Reel reel = getReelById(reelId);
        if (reel != null) {
            reel.incrementShares();
            reelRepository.save(reel);
        }
    }

    @Transactional
    public void deleteReel(UUID reelId) {
        Reel reel = getReelById(reelId);
        if (reel != null) {
            reel.delete();
            reelRepository.save(reel);
        }
    }

    @Transactional
    public void editReel(UUID reelId, String newCaption) {
        Reel reel = getReelById(reelId);
        if (reel != null) {
            reel.editCaption(newCaption);
            reelRepository.save(reel);
        }
    }

    @Transactional(readOnly = true)
    public Page<Reel> getRandomReels(Pageable pageable) {
        return reelRepository.findRandomReels(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reel> getReelsForDuet(Pageable pageable) {
        return reelRepository.findReelsForDuet(pageable);
    }

    @Transactional(readOnly = true)
    public boolean isReelLikedByUser(UUID reelId, UUID userId) {
        Reel reel = getReelById(reelId);
        User user = new User();
        user.setId(userId);
        return reelLikeRepository.findByReelAndUser(reel, user) != null;
    }
}
