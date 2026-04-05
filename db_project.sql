-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 05, 2026 at 05:54 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `background_settings`
--

CREATE TABLE `background_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_name` varchar(50) NOT NULL,
  `setting_value` varchar(500) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `background_settings`
--

INSERT INTO `background_settings` (`setting_id`, `setting_name`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES
(0, 'client_background', '/isda_bg.png', 'Background image for client/worker pages', '2026-03-27 13:03:34', '2026-03-27 13:03:34');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_entries`
--

CREATE TABLE `cash_register_entries` (
  `entry_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `entry_type` enum('cash','cash-return','cash-expense','cash-adjustment') NOT NULL DEFAULT 'cash',
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_reconciliations`
--

CREATE TABLE `cash_register_reconciliations` (
  `reconcile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `actual_cash` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_register_reconciliations`
--

INSERT INTO `cash_register_reconciliations` (`reconcile_id`, `user_id`, `actual_cash`, `created_at`) VALUES
(1, 2, 300.00, '2026-04-04 14:57:06'),
(2, 2, -300.00, '2026-04-04 16:58:45'),
(3, 2, 300.00, '2026-04-04 16:58:51'),
(4, 2, 0.00, '2026-04-04 16:58:56');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `invoice_pdf_path` varchar(500) DEFAULT NULL,
  `issued_by_user_id` int(11) DEFAULT NULL,
  `issued_by_name` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_requests`
--

CREATE TABLE `invoice_requests` (
  `request_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `request_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `requested_by` int(11) NOT NULL,
  `email_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` varchar(500) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT 'cash_on_store',
  `paid_by_user_id` int(11) DEFAULT NULL,
  `paid_by_name` varchar(120) DEFAULT NULL,
  `invoice_pdf_path` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `cancellation_status` enum('none','requested','approved','rejected') DEFAULT 'none',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_cancellation_requests`
--

CREATE TABLE `order_cancellation_requests` (
  `request_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `unit_discount` decimal(10,2) DEFAULT 0.00,
  `line_total` decimal(10,2) GENERATED ALWAYS AS ((`price` - `unit_discount`) * `quantity`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `image_url` varchar(500) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`, `category`, `price`, `stock`, `low_stock_threshold`, `image_url`, `is_deleted`, `created_at`, `updated_at`) VALUES
(1, 'Clown Fish', 'Clownfish (Amphiprioninae) are small, brightly colored saltwater fish best known for their orange bodies with white stripes (like in Finding Nemo). They naturally live in warm ocean reefs and often form a symbiotic relationship with sea anemones, which provide them protection.\n\nHow to Take Care of Clownfish:\n1. Tank Setup\nMinimum tank size: 20 gallons (for a pair)\nUse a saltwater aquarium (not freshwater)\nMaintain temperature: 24–27°C\npH level: 8.0–8.4\nAdd hiding spots like rocks or coral decorations\nOptional: sea anemone (only for experienced setups)\n\n2. Water Quality\nUse a marine filter and protein skimmer if possible\nRegular water changes (10–20% every 2 weeks)\nKeep ammonia and nitrites at 0 ppm\n\n3. Feeding\nFeed 1–2 times daily\nDiet includes:\nMarine flakes or pellets\nFrozen foods (brine shrimp, mysis shrimp)\n\n4. Behavior & Compatibility\nGenerally peaceful but can be territorial\nBest kept in pairs or alone\nCompatible with other calm saltwater fish\n\n5. Lighting\nModerate lighting is enough\nStrong lighting needed only if keeping corals/anemones\n\n6. Maintenance Tips\nMonitor salinity (1.020–1.025 specific gravity)\nAvoid sudden changes in water conditions\nObserve for signs of stress or disease (loss of color, erratic swimming)', 'Salt Water Fish', 150.00, 21, 5, 'http://localhost:5000/uploads/1775273211559-410317425.jpg', 0, '2026-04-04 03:26:53', '2026-04-04 15:49:44'),
(2, 'Gold Fish', 'Goldfish (Carassius auratus) are popular freshwater fish known for their bright orange color (though they can also be white, black, or mixed). They’re hardy and great for beginners, but they need more space and care than most people expect.\n\nHow to Take Care of Goldfish:\n1. Tank Setup\nMinimum tank size: 20 gallons for one goldfish (they grow big!)\nAdd 10 gallons for each additional fish\nUse a filter (goldfish produce a lot of waste)\nInclude gravel, plants, or decorations for enrichment\nAvoid small bowls ❌ (they cause poor health)\n\n2. Water Conditions\nTemperature: 18–24°C (they prefer cooler water)\npH level: 6.5–7.5\nNo heater usually needed (room temp is fine)\nKeep ammonia and nitrites at 0 ppm\n\n3. Feeding\nFeed 1–2 times daily (small amounts)\nDiet includes:\nGoldfish flakes or pellets\nVegetables (peas, lettuce, spinach)\nOccasional treats (bloodworms, brine shrimp)\n\n4. Behavior & Compatibility\nPeaceful and social\nBest kept with other goldfish\nAvoid aggressive or tropical fish (different needs)\n\n5. Cleaning & Maintenance\nWeekly water change (20–30%)\nClean filter regularly (but don’t remove all good bacteria)\nRemove uneaten food to prevent dirty water\n\n6. Important Tips\nGoldfish grow large (up to 6–12 inches depending on type)\nThey can live 10–15 years with proper care\nOverfeeding is a common mistake—feed lightly', 'Fresh Water Fish', 95.00, 24, 5, 'http://localhost:5000/uploads/1775279841085-917402665.jpg', 0, '2026-04-04 05:17:26', '2026-04-04 15:49:38'),
(3, 'Janitor Fish', 'Janitor Fish (Pleco / Hypostomus plecostomus) are freshwater fish known for their sucker mouths and ability to cling to surfaces. They’re often called “cleaner fish” because they eat algae, but they don’t fully clean a tank on their own.\n\nHow to Take Care of Janitor Fish:\n1. Tank Setup\nMinimum tank size: 75–100 gallons (they grow BIG)\nProvide driftwood, rocks, and hiding spots\nUse a strong filter (they produce a lot of waste)\n\n2. Water Conditions\nTemperature: 23–30°C\npH level: 6.5–7.5\nKeep water clean with regular changes (20–30% weekly)\n\n3. Feeding\nNot just algae eaters ❗\nDiet includes:\nAlgae wafers\nVegetables (zucchini, cucumber, spinach)\nOccasional protein (sinking pellets, shrimp)\n\n4. Behavior & Compatibility\nMostly peaceful but can be territorial as they grow\nBest with medium to large fish\nAvoid very small fish (may get stressed or harmed)\n\n5. Important Tips\nCan grow up to 12–24 inches depending on species 😮\nNocturnal (more active at night)\nNeed driftwood (helps digestion)\nProduce a lot of waste → don’t rely on them for cleaning', 'Fresh Water Fish', 110.00, 23, 5, 'http://localhost:5000/uploads/1775279914040-28216811.jpg', 0, '2026-04-04 05:18:39', '2026-04-04 15:28:02'),
(4, 'TetraMin Tropical Flakes 62g', 'Flake food suitable for most fish. Easy to eat and digest, making it ideal for daily feeding.', 'Supplies', 70.00, 30, 5, 'http://localhost:5000/uploads/1775280970457-584768232.webp', 0, '2026-04-04 05:36:31', '2026-04-04 05:36:31'),
(5, 'Ocean Nutrition Formula One Flakes 34g', 'Balanced flakes for both freshwater and saltwater fish. Provides essential nutrients for everyday feeding.', 'Supplies', 89.00, 44, 5, 'http://localhost:5000/uploads/1775281144673-136227332.png', 0, '2026-04-04 05:39:16', '2026-04-04 05:41:37'),
(6, 'Aqueon Tropical Pellets 198g', 'Daily-use pellets for community fish. Provides balanced nutrition and supports fish health.', 'Supplies', 200.00, 27, 5, 'http://localhost:5000/uploads/1775281349151-882044713.jpg', 0, '2026-04-04 05:42:31', '2026-04-04 15:05:28'),
(7, 'Tetra PlecoWafers 86g', 'Algae-based wafers for fish that eat at the bottom. Supports digestion and steady nutrition.', 'Supplies', 80.00, 39, 5, 'http://localhost:5000/uploads/1775281436948-492311804.png', 0, '2026-04-04 05:44:00', '2026-04-04 15:28:18'),
(8, 'Angel Fish', 'Angelfish (Pterophyllum) are elegant, disc-shaped freshwater fish native to the Amazon River basin. Known for their graceful, wing-like fins and distinctive triangular bodies, they are a staple in the aquarium hobby. While they belong to the cichlid family, they are much more poised than their aggressive cousins, though they still retain a dignified, \"regal\" personality.\n\nHow to Take Care of Angelfish:\n1. Tank Setup\nMinimum tank size: 30 gallons (tall tanks are better to accommodate their long fins)\nUse a freshwater aquarium\nMaintain temperature: 24–29°C\npH level: 6.5–7.5\nDecor: Include tall plants (like Amazon Swords) and driftwood to mimic their natural habitat\n\n2. Water Quality\nUse a high-quality canister or power filter with a gentle flow (strong currents can stress them)\nRegular water changes: 20–25% every week\nKeep ammonia and nitrites at 0 ppm; keep nitrates low\n\n3. Feeding\nFeed 1–2 times daily\nDiet includes:\nHigh-quality tropical flakes or pellets\nFrozen or live foods (bloodworms, brine shrimp, tubifex)\nOccasional vegetable-based flakes\n\n4. Behavior & Compatibility\nSemi-aggressive: Generally peaceful but can become territorial during spawning\nCompatibility: Best kept with other medium-sized tropical fish (Corydoras, larger Tetras, Gouramis)\nCaution: Avoid very small fish (like Neon Tetras) as Angelfish may eat them when they grow large enough\n\n5. Lighting\nModerate, natural-cycle lighting (8–10 hours a day)\nIf using live plants, ensure the light spectrum supports plant growth\n\n6. Maintenance Tips\nHeight matters: Ensure the tank is tall enough so their fins don\'t drag or get cramped\nStability: Angelfish are sensitive to shifts in water chemistry; drip-acclimate when introducing them\nHealth Watch: Check for \"hole-in-the-head\" disease or fin rot, often caused by poor water quality', 'Fresh Water Fish', 160.00, 45, 5, 'http://localhost:5000/uploads/1775281718650-363831253.jpg', 0, '2026-04-04 05:49:54', '2026-04-04 14:43:27');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `review_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `created_at`) VALUES
(1, 'customer', 'Regular customer - can browse and purchase', '2026-03-26 22:01:16'),
(2, 'admin', 'Administrator - can manage products and orders', '2026-03-26 22:01:16'),
(3, 'moderator', 'Moderator - can manage orders and reports', '2026-03-26 22:01:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

CREATE TABLE `user_accounts` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(20) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` text NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `role_id` int(11) DEFAULT 1,
  `legacy_role` enum('admin','client','worker') DEFAULT 'client',
  `is_verified` tinyint(1) DEFAULT 0,
  `otp` varchar(10) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `is_senior` tinyint(1) DEFAULT 0,
  `is_pwd` tinyint(1) DEFAULT 0,
  `senior_verified` tinyint(1) DEFAULT 0,
  `pwd_verified` tinyint(1) DEFAULT 0,
  `id_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `birthday`, `gender`, `contact_number`, `address`, `email`, `password`, `role_id`, `legacy_role`, `is_verified`, `otp`, `otp_expires_at`, `is_senior`, `is_pwd`, `senior_verified`, `pwd_verified`, `id_image_url`, `created_at`, `is_deleted`) VALUES
(1, 'Hatsune', '', 'Miku', '', '2007-08-31', 'Female', '09123456789', 'Japan', 'harijie.mabilin@cvsu.edu.ph', '$2b$10$5vdmFsuWbTXhvScM2.Ow7u85RySVsFR.IcVPnA4K6XfK4lHbcsFBm', 1, 'client', 1, NULL, NULL, 0, 0, 0, 0, NULL, '2026-03-18 12:33:18', 0),
(2, 'TongTong', '', 'Fish', '', '1111-11-11', 'Fish', '09123456789', 'Imus', 'tongtongornamental@gmail.com', '$2b$10$HoDGtrCo7BRHTIqO2SfGYeLw8WO.arpG9gA2a8OX.4pPwkOnF8hqy', 2, 'admin', 1, NULL, NULL, 0, 0, 0, 0, 'http://localhost:5000/uploads/1775315472749-541703962.jpg', '2026-03-18 12:34:27', 0),
(3, 'Harijie', '', 'Mabilin', '', '2004-07-15', 'Male', '09987654321', 'bacoor', 'harijiem@gmail.com', '$2b$10$VMiuUOPIR7NmWRb0gpZAwem2RbakIdmm/ZbxVqi0W8nddmt5ygFY.', 3, 'worker', 1, NULL, NULL, 0, 0, 0, 0, NULL, '2026-03-18 12:35:18', 0),
(4, 'Megurine', '', 'Luka', '', '0000-00-00', 'Female', '12321423423', 'Japan', 'mharijie@gmail.com', '$2b$10$Evj/gCB2HZZcNb50yEbXIuk0ji68dYbsJJUCHvOiyhxIq2NuFykfm', 1, 'client', 1, NULL, NULL, 0, 0, 0, 0, 'http://localhost:5000/uploads/1775265752811-642736095.jpg', '2026-04-03 04:22:18', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_session_logs`
--

CREATE TABLE `user_session_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role_name` varchar(50) DEFAULT NULL,
  `login_at` datetime NOT NULL DEFAULT current_timestamp(),
  `logout_at` datetime DEFAULT NULL,
  `login_success` tinyint(1) NOT NULL DEFAULT 1,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_token` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_session_logs`
--

INSERT INTO `user_session_logs` (`log_id`, `user_id`, `email`, `role_name`, `login_at`, `logout_at`, `login_success`, `ip_address`, `user_agent`, `session_token`) VALUES
(1, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 22:21:01', '2026-04-04 22:22:58', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '103def41d22f4d5a67cbcf9ba831f22ccef8187e94737478'),
(2, 3, 'harijiem@gmail.com', 'moderator', '2026-04-04 22:23:25', '2026-04-04 22:23:34', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '5e235091edbb8f5c74d86e605743fd1097535f48a93df2a7'),
(3, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 22:42:48', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f74c9d1d3fc706ac33479e4c1b369ad77b34e43b6ebd1481'),
(4, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 22:50:05', '2026-04-04 23:03:35', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '1b785e5e31d9446c7c2e62a76ab8b3d2c3ee15ed268247d8'),
(5, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 23:04:38', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '347087a4321f9d03dcfb3aea68d84279974e44c0ca534b56'),
(6, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 23:14:02', '2026-04-04 23:17:02', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bbe0d18812f348393ed1f563836a84d87e8668fdd8138b88'),
(7, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-04 23:19:21', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f08548788186f455b49444067a44035e28b08a139c073873'),
(8, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 00:14:37', '2026-04-05 00:42:09', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'c3a7d47c44dfd7ad3f53a19543c067c093a6f2b60dce3e3e'),
(9, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 00:57:59', '2026-04-05 01:14:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd55daac7dc424e191ec08e011f11704a19bd2f39ae21777f'),
(10, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 21:03:29', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'ffe2d803e317f521019667fedcdb92cde3496744198e9553'),
(11, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 21:34:30', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd2fa54a4f55ca28cc178481eb747b9203ce3811f16ca478f'),
(12, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 21:45:47', '2026-04-05 21:53:56', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '3879ccf11641845a86295f3de90a1569648cf5a4bbcf08db'),
(13, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:00:32', '2026-04-05 22:04:04', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '5a42f0faafe3613593e5d9ea273210cde1790c6248cdb06e'),
(14, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:07:38', '2026-04-05 22:09:20', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '8a4256771354f6deea8ffaa309244dcd0d76eaa9b504ce28'),
(15, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:11:43', '2026-04-05 22:34:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '277e8bc4b7e6ce2a52a79966e4392ffdbc1c2a02343ed9db'),
(16, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:50:23', '2026-04-05 22:54:45', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'de365245be568db6759305699afaa27948f1356cd4b25256'),
(17, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:56:41', '2026-04-05 22:57:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'ccaad9b84a5007ac579d3adf54d0163fdf62819f487eb620'),
(18, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 22:59:55', '2026-04-05 23:02:00', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'ee05f65e2b8f68f01656b3857855099d48a3c9861d2762b3'),
(19, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 23:19:12', '2026-04-05 23:19:34', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b2c5de7be1252f00682dd7b091d424d43a850654e401dba1'),
(20, 3, 'harijiem@gmail.com', 'moderator', '2026-04-05 23:19:58', '2026-04-05 23:20:57', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f669efedd70146bd8354d239939f1988a2c8de038fd97667'),
(21, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 23:21:12', '2026-04-05 23:28:35', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '3300a566b3e831caea09deff413ed4032d32239249c9b45c'),
(22, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 23:35:57', '2026-04-05 23:45:26', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd17b4b5148a87a92a5a0926d7b9da461e3dd7b233b94c95c');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `background_settings`
--
ALTER TABLE `background_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`),
  ADD UNIQUE KEY `setting_name_2` (`setting_name`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`cart_id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `cash_register_entries`
--
ALTER TABLE `cash_register_entries`
  ADD PRIMARY KEY (`entry_id`),
  ADD KEY `idx_cash_register_entries_user_id` (`user_id`);

--
-- Indexes for table `cash_register_reconciliations`
--
ALTER TABLE `cash_register_reconciliations`
  ADD PRIMARY KEY (`reconcile_id`),
  ADD KEY `idx_cash_register_reconciliations_user_id` (`user_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `invoice_requests`
--
ALTER TABLE `invoice_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `requested_by` (`requested_by`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_cancellation_requests`
--
ALTER TABLE `order_cancellation_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `unique_product_name` (`name`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_verified_purchase` (`is_verified_purchase`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `user_accounts`
--
ALTER TABLE `user_accounts`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_session_logs`
--
ALTER TABLE `user_session_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user_session_logs_user` (`user_id`),
  ADD KEY `idx_user_session_logs_login_at` (`login_at`),
  ADD KEY `idx_user_session_logs_session_token` (`session_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cash_register_entries`
--
ALTER TABLE `cash_register_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cash_register_reconciliations`
--
ALTER TABLE `cash_register_reconciliations`
  MODIFY `reconcile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_requests`
--
ALTER TABLE `invoice_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_cancellation_requests`
--
ALTER TABLE `order_cancellation_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_session_logs`
--
ALTER TABLE `user_session_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cash_register_entries`
--
ALTER TABLE `cash_register_entries`
  ADD CONSTRAINT `cash_register_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_accounts` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `cash_register_reconciliations`
--
ALTER TABLE `cash_register_reconciliations`
  ADD CONSTRAINT `cash_register_reconciliations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_accounts` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_session_logs`
--
ALTER TABLE `user_session_logs`
  ADD CONSTRAINT `fk_user_session_logs_user` FOREIGN KEY (`user_id`) REFERENCES `user_accounts` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
