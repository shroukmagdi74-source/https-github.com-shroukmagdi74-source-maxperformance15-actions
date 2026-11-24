const express = require('express');
const router = express.Router();
const controller = require('../controller/competitorController');
const verifyToken = require("../utils/verifyToken");

router.use(verifyToken.authenticateToken);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/reports/all', controller.getAllReports);
router.post('/reports/generate-all', controller.generateAllReports);
router.post('/changes/run-cycle', controller.runChangelogCycle);
router.get('/auto-discover', controller.autoDiscover);
router.get('/summary', controller.summary);
router.get('/status-counts', controller.getStatusCounts);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.remove);

router.get('/:id/products', controller.listProducts);
router.post('/:id/products', controller.addProduct);
router.get('/:id/products/:productId/price-history', controller.getPriceHistory);
router.get('/:id/ads', controller.listAds);
router.post('/:id/ads', controller.addAd);
router.post('/:id/ads/sync-creatives', controller.syncCreatives);
router.post('/ads/sync-all-creatives', controller.syncCreatives);
router.post('/:id/reports/generate', controller.generateReport);
router.get('/:id/changes', controller.getChanges);
router.post('/:id/changes/check-now', controller.checkChangesNow);

// ---- Competitor Site Credentials (Encrypted AES-GCM) ----
router.get('/:id/credentials', controller.getCredentials);
router.put('/:id/credentials', controller.setCredentials);
router.post('/:id/credentials', controller.setCredentials);
router.delete('/:id/credentials', controller.deleteCredentials);
router.post('/:id/credentials/mark-used', controller.markCredentialsUsed);
router.post('/:id/scan-tech', controller.scanTech);
router.get('/:id/reports', controller.listReports);
router.get('/:id/features', controller.listFeatures);
router.post('/:id/features', controller.createFeature);
router.put('/:id/features/:featureId', controller.updateFeature);
router.delete('/:id/features/:featureId', controller.deleteFeature);

router.get('/:id/dev-recommendations', controller.getDevRecommendations);
router.put('/:id/dev-recommendations', controller.upsertDevRecommendationNotes);
router.post('/:id/dev-tasks', controller.addDevTask);
router.put('/:id/dev-tasks/:taskId', controller.updateDevTask);
router.put('/:id/dev-tasks/:taskId/toggle', controller.toggleDevTask);
router.delete('/:id/dev-tasks/:taskId', controller.deleteDevTask);

router.get('/:id/price-compare', controller.priceCompare);
router.get('/:id/battlecard', controller.getBattlecard);

// ---- Media Notes ----
router.get('/:id/media-notes', controller.getMediaNotes);
router.post('/:id/media-notes', controller.addMediaNote);
router.put('/:id/media-notes/:noteId', controller.updateMediaNote);
router.delete('/:id/media-notes/:noteId', controller.deleteMediaNote);

// ---- Comparisons ----
router.get('/:id/comparisons', controller.listComparisons);
router.post('/:id/comparisons', controller.createComparison);
router.put('/:id/comparisons/reorder', controller.reorderComparisons);
router.put('/:id/comparisons/:comparisonId', controller.updateComparison);
router.delete('/:id/comparisons/:comparisonId', controller.deleteComparison);

// ---- Dev Ideas ----
router.get('/:id/dev-ideas', controller.listDevIdeas);
router.post('/:id/dev-ideas', controller.createDevIdea);
router.put('/:id/dev-ideas/reorder', controller.reorderDevIdeas);
router.put('/:id/dev-ideas/:ideaId', controller.updateDevIdea);
router.delete('/:id/dev-ideas/:ideaId', controller.deleteDevIdea);
router.post('/:id/dev-ideas/:ideaId/images', controller.addDevIdeaImage);
router.delete('/:id/dev-ideas/:ideaId/images/:imageId', controller.deleteDevIdeaImage);

// ---- Activity Images ----
router.get('/:id/activity-images', controller.listActivityImages);
router.post('/:id/activity-images', controller.addActivityImage);
router.put('/:id/activity-images/reorder', controller.reorderActivityImages);
router.delete('/:id/activity-images/:imageId', controller.deleteActivityImage);

// ---- Feature Images ----
router.get('/:id/feature-images', controller.listFeatureImages);
router.post('/:id/feature-images', controller.addFeatureImage);
router.put('/:id/feature-images/reorder', controller.reorderFeatureImages);
router.delete('/:id/feature-images/:imageId', controller.deleteFeatureImage);

// ---- Social Profile Credentials ----
router.put('/:id/social-profiles/:profileId/credentials', controller.updateSocialProfileCredentials);

module.exports = router;
