-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2026 at 04:42 PM
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
(0, 'client_background', 'http://localhost:5000/uploads/1775662017021-182742194.png', 'Background image for client/worker pages', '2026-03-27 13:03:34', '2026-04-08 15:26:57');

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
  `customer_name` varchar(120) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `invoice_pdf_path` varchar(500) DEFAULT NULL,
  `issued_by_user_id` int(11) DEFAULT NULL,
  `issued_by_name` varchar(120) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'issued',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `order_id`, `invoice_number`, `customer_name`, `email`, `contact_number`, `total_amount`, `payment_method`, `invoice_pdf_path`, `issued_by_user_id`, `issued_by_name`, `status`, `created_at`) VALUES
(1, 1, 'INV-1-1775790103495', NULL, NULL, NULL, NULL, 'cash_on_store', '/uploads/invoices/INV-1-1775790103495.pdf', NULL, NULL, 'issued', '2026-04-10 03:01:43'),
(2, 2, 'INV-2-1775831871302', NULL, NULL, NULL, NULL, 'cash_on_store', '/uploads/invoices/INV-2-1775831871302.pdf', NULL, NULL, 'issued', '2026-04-10 14:37:51');

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

--
-- Dumping data for table `invoice_requests`
--

INSERT INTO `invoice_requests` (`request_id`, `invoice_id`, `request_time`, `requested_by`, `email_sent`) VALUES
(1, 1, '2026-04-10 03:01:47', 4, 1),
(2, 2, '2026-04-10 14:37:54', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(120) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
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

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `customer_name`, `email`, `contact_number`, `total_amount`, `shipping_address`, `payment_method`, `paid_by_user_id`, `paid_by_name`, `invoice_pdf_path`, `status`, `cancellation_status`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, NULL, NULL, 178.00, 'Japan', 'cash_on_store', NULL, NULL, '/uploads/invoices/INV-1-1775790103495.pdf', 'processing', 'none', '2026-04-10 03:01:43', '2026-04-10 03:20:54'),
(2, 4, NULL, NULL, NULL, 295.00, 'Japan', 'cash_on_store', NULL, NULL, '/uploads/invoices/INV-2-1775831871302.pdf', 'pending', 'none', '2026-04-10 14:37:51', '2026-04-10 14:37:59');

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price`, `unit_discount`, `created_at`) VALUES
(1, 1, 5, 2, 89.00, 0.00, '2026-04-10 03:01:43'),
(2, 2, 2, 1, 95.00, 0.00, '2026-04-10 14:37:51'),
(3, 2, 6, 1, 200.00, 0.00, '2026-04-10 14:37:51');

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
(2, 'Gold Fish', 'Goldfish (Carassius auratus) are popular freshwater fish known for their bright orange color (though they can also be white, black, or mixed). They’re hardy and great for beginners, but they need more space and care than most people expect.\n\nHow to Take Care of Goldfish:\n1. Tank Setup\nMinimum tank size: 20 gallons for one goldfish (they grow big!)\nAdd 10 gallons for each additional fish\nUse a filter (goldfish produce a lot of waste)\nInclude gravel, plants, or decorations for enrichment\nAvoid small bowls ❌ (they cause poor health)\n\n2. Water Conditions\nTemperature: 18–24°C (they prefer cooler water)\npH level: 6.5–7.5\nNo heater usually needed (room temp is fine)\nKeep ammonia and nitrites at 0 ppm\n\n3. Feeding\nFeed 1–2 times daily (small amounts)\nDiet includes:\nGoldfish flakes or pellets\nVegetables (peas, lettuce, spinach)\nOccasional treats (bloodworms, brine shrimp)\n\n4. Behavior & Compatibility\nPeaceful and social\nBest kept with other goldfish\nAvoid aggressive or tropical fish (different needs)\n\n5. Cleaning & Maintenance\nWeekly water change (20–30%)\nClean filter regularly (but don’t remove all good bacteria)\nRemove uneaten food to prevent dirty water\n\n6. Important Tips\nGoldfish grow large (up to 6–12 inches depending on type)\nThey can live 10–15 years with proper care\nOverfeeding is a common mistake—feed lightly', 'Fresh Water Fish', 95.00, 20, NULL, 'http://localhost:5000/uploads/1775279841085-917402665.jpg', 0, '2026-04-04 05:17:26', '2026-04-10 14:37:51'),
(3, 'Janitor Fish', 'Janitor Fish (Pleco / Hypostomus plecostomus) are freshwater fish known for their sucker mouths and ability to cling to surfaces. They’re often called “cleaner fish” because they eat algae, but they don’t fully clean a tank on their own.\n\nHow to Take Care of Janitor Fish:\n1. Tank Setup\nMinimum tank size: 75–100 gallons (they grow BIG)\nProvide driftwood, rocks, and hiding spots\nUse a strong filter (they produce a lot of waste)\n\n2. Water Conditions\nTemperature: 23–30°C\npH level: 6.5–7.5\nKeep water clean with regular changes (20–30% weekly)\n\n3. Feeding\nNot just algae eaters ❗\nDiet includes:\nAlgae wafers\nVegetables (zucchini, cucumber, spinach)\nOccasional protein (sinking pellets, shrimp)\n\n4. Behavior & Compatibility\nMostly peaceful but can be territorial as they grow\nBest with medium to large fish\nAvoid very small fish (may get stressed or harmed)\n\n5. Important Tips\nCan grow up to 12–24 inches depending on species 😮\nNocturnal (more active at night)\nNeed driftwood (helps digestion)\nProduce a lot of waste → don’t rely on them for cleaning', 'Fresh Water Fish', 110.00, 23, 5, 'http://localhost:5000/uploads/1775279914040-28216811.jpg', 0, '2026-04-04 05:18:39', '2026-04-04 15:28:02'),
(4, 'TetraMin Tropical Flakes 62g', 'Flake food suitable for most fish. Easy to eat and digest, making it ideal for daily feeding.', 'Supplies', 70.00, 30, 5, 'http://localhost:5000/uploads/1775280970457-584768232.webp', 0, '2026-04-04 05:36:31', '2026-04-04 05:36:31'),
(5, 'Ocean Nutrition Formula One Flakes 34g', 'Balanced flakes for both freshwater and saltwater fish. Provides essential nutrients for everyday feeding.', 'Supplies', 89.00, 42, 5, 'http://localhost:5000/uploads/1775281144673-136227332.png', 0, '2026-04-04 05:39:16', '2026-04-10 03:01:43'),
(6, 'Aqueon Tropical Pellets 198g', 'Daily-use pellets for community fish. Provides balanced nutrition and supports fish health.', 'Supplies', 200.00, 21, NULL, 'http://localhost:5000/uploads/1775281349151-882044713.jpg', 0, '2026-04-04 05:42:31', '2026-04-10 14:37:51'),
(7, 'Tetra PlecoWafers 86g', 'Algae-based wafers for fish that eat at the bottom. Supports digestion and steady nutrition.', 'Supplies', 80.00, 27, NULL, 'http://localhost:5000/uploads/1775281436948-492311804.png', 0, '2026-04-04 05:44:00', '2026-04-07 16:46:42'),
(8, 'Angel Fish', 'Angelfish (Pterophyllum) are elegant, disc-shaped freshwater fish native to the Amazon River basin. Known for their graceful, wing-like fins and distinctive triangular bodies, they are a staple in the aquarium hobby. While they belong to the cichlid family, they are much more poised than their aggressive cousins, though they still retain a dignified, \"regal\" personality.\n\nHow to Take Care of Angelfish:\n1. Tank Setup\nMinimum tank size: 30 gallons (tall tanks are better to accommodate their long fins)\nUse a freshwater aquarium\nMaintain temperature: 24–29°C\npH level: 6.5–7.5\nDecor: Include tall plants (like Amazon Swords) and driftwood to mimic their natural habitat\n\n2. Water Quality\nUse a high-quality canister or power filter with a gentle flow (strong currents can stress them)\nRegular water changes: 20–25% every week\nKeep ammonia and nitrites at 0 ppm; keep nitrates low\n\n3. Feeding\nFeed 1–2 times daily\nDiet includes:\nHigh-quality tropical flakes or pellets\nFrozen or live foods (bloodworms, brine shrimp, tubifex)\nOccasional vegetable-based flakes\n\n4. Behavior & Compatibility\nSemi-aggressive: Generally peaceful but can become territorial during spawning\nCompatibility: Best kept with other medium-sized tropical fish (Corydoras, larger Tetras, Gouramis)\nCaution: Avoid very small fish (like Neon Tetras) as Angelfish may eat them when they grow large enough\n\n5. Lighting\nModerate, natural-cycle lighting (8–10 hours a day)\nIf using live plants, ensure the light spectrum supports plant growth\n\n6. Maintenance Tips\nHeight matters: Ensure the tank is tall enough so their fins don\'t drag or get cramped\nStability: Angelfish are sensitive to shifts in water chemistry; drip-acclimate when introducing them\nHealth Watch: Check for \"hole-in-the-head\" disease or fin rot, often caused by poor water quality', 'Fresh Water Fish', 160.00, 45, 5, 'http://localhost:5000/uploads/1775281718650-363831253.jpg', 1, '2026-04-04 05:49:54', '2026-04-07 17:13:53');

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
(3, 'moderator', 'Moderator - can manage orders and reports', '2026-03-26 22:01:16'),
(4, 'worker', 'Worker role for cashier and operations', '2026-04-05 16:05:49');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_logs`
--

CREATE TABLE `transaction_logs` (
  `log_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `customer_name` varchar(120) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` varchar(500) DEFAULT NULL,
  `processed_by_user_id` int(11) DEFAULT NULL,
  `processed_by_name` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `profile_image_url` varchar(500) DEFAULT NULL,
  `id_image_url` varchar(500) DEFAULT NULL,
  `id_front_image_url` varchar(500) DEFAULT NULL,
  `id_back_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_accounts`
--

INSERT INTO `user_accounts` (`user_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `birthday`, `gender`, `contact_number`, `address`, `email`, `password`, `role_id`, `legacy_role`, `is_verified`, `otp`, `otp_expires_at`, `is_senior`, `is_pwd`, `senior_verified`, `pwd_verified`, `profile_image_url`, `id_image_url`, `id_front_image_url`, `id_back_image_url`, `created_at`, `is_deleted`) VALUES
(1, 'Hatsune', '', 'Miku', '', '2007-08-31', 'Female', '09123456789', 'Japan', 'harijie.mabilin@cvsu.edu.ph', '$2b$10$5vdmFsuWbTXhvScM2.Ow7u85RySVsFR.IcVPnA4K6XfK4lHbcsFBm', 1, 'client', 1, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '2026-03-18 12:33:18', 0),
(2, 'TongTong', '', 'Fish', '', '1111-11-11', 'Fish', '09123456789', 'Imus', 'tongtongornamental@gmail.com', '$2b$10$HoDGtrCo7BRHTIqO2SfGYeLw8WO.arpG9gA2a8OX.4pPwkOnF8hqy', 2, 'admin', 1, NULL, NULL, 0, 0, 0, 0, NULL, 'http://localhost:5000/uploads/1775315472749-541703962.jpg', NULL, NULL, '2026-03-18 12:34:27', 0),
(3, 'Harijie', '', 'Mabilin', '', '2004-07-15', 'Male', '09987654321', 'bacoor', 'harijiem@gmail.com', '$2b$10$WEzjRPjozS2MORthRAKWUO89fN0C5qcieM8ehtgk3IMDvyPveWPD6', 3, 'worker', 1, NULL, NULL, 0, 0, 0, 0, NULL, 'http://localhost:5000/uploads/1775406378600-744408257.jpeg', NULL, NULL, '2026-03-18 12:35:18', 0),
(4, 'Megurine', '', 'Luka', '', '0000-00-00', 'Female', '12321423423', 'Japan', 'mharijie@gmail.com', '$2b$10$Evj/gCB2HZZcNb50yEbXIuk0ji68dYbsJJUCHvOiyhxIq2NuFykfm', 1, 'client', 1, NULL, NULL, 1, 0, 0, 0, 'http://localhost:5000/uploads/1775786214253-827404032.jpg', 'http://localhost:5000/uploads/1775788483480-543149127.jpeg', 'http://localhost:5000/uploads/1775788483480-543149127.jpeg', 'http://localhost:5000/uploads/1775788483486-870164879.jpeg', '2026-04-03 04:22:18', 0);

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
(22, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-05 23:35:57', '2026-04-05 23:45:26', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd17b4b5148a87a92a5a0926d7b9da461e3dd7b233b94c95c'),
(23, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 00:07:01', '2026-04-06 00:10:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '15e2b7638670987edf5aa7b659437707df3e2035ae6bc5d8'),
(24, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 00:11:09', '2026-04-06 00:14:17', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '03080aee247e5acb5aa64eeb622eb5f718f9ea074057dffe'),
(25, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 00:24:54', '2026-04-06 00:25:12', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f91e6af760fd570d4b5c9ad03fc480c1a53e88d9d371162d'),
(26, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 00:25:33', '2026-04-06 00:26:24', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '026c67f6fc899810da4d7352c797352fa3fc0739a3e4acf3'),
(27, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 00:26:44', '2026-04-06 00:26:46', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '1cc74d8d50adc2ad888cea2fe6adc303392ea03cd87d9aa7'),
(28, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 00:27:09', '2026-04-06 00:27:12', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '83dcbe1dfd38da9d3c6731905f9c9afded30879cb29758bd'),
(29, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 05:25:09', '2026-04-06 05:27:38', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '8990797c577d0d5a50bda4d09742c3eab21201c886f93281'),
(30, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 05:27:51', '2026-04-06 05:27:58', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'aeb249b8d3159543c293ac310ab4b5f85c729e0285a25915'),
(31, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 05:28:37', '2026-04-06 05:34:15', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '574fd42689e73102507a57eebb8856d3777a686c86faa44a'),
(32, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 05:41:10', '2026-04-06 05:49:41', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f54902aab0fbb491c8304a1eb8c1721635460813886c5a16'),
(33, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 05:52:46', '2026-04-06 05:55:19', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7fce84f03de82f93d3aa3ceb8ac8e44af0364a47038de793'),
(34, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 05:57:42', '2026-04-06 05:58:25', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f0b7ec907a5191f519d25fe6bdf974a0fcc31b8559480977'),
(35, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 05:58:41', '2026-04-06 06:01:11', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bd4ed3d20e366d5b6e6c11f528d2ad380c3f771c6cf2b7db'),
(36, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:03:11', '2026-04-06 06:05:16', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '65ad9f60e4a827a948984772652e81852e16c68a8d0915fd'),
(37, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:07:06', '2026-04-06 06:08:00', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a8373d5e320679b1ce2f3a50ce663e3ae18359fa2e8b562b'),
(38, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 06:08:12', '2026-04-06 06:13:34', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '5f6c0e88bd4ccd2acfa135c7626acfd934288b12a16c792a'),
(39, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:18:11', '2026-04-06 06:18:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '817ce9779023299ab09a0e160c707167b3d464fc508c6988'),
(40, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:19:00', '2026-04-06 06:19:46', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '79669667b1ea46d5181b374e4b784902b03c47adef707613'),
(41, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 06:19:59', '2026-04-06 06:20:58', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '2a283bcf210884b7f32c35231ec48f8c149724e0b3b17265'),
(42, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:24:21', '2026-04-06 06:26:22', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '07c3ef309bc94053849e650b0dafe079b5b0c48fa66e2b52'),
(43, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 06:26:38', '2026-04-06 06:28:23', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b1f7a28aa0d606c40f795f3a937f0ccea197abe33d16fbf0'),
(44, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:37:17', '2026-04-06 06:37:54', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '9a7ee7f4b1029722c3d9c4d79a5e5a016ed876ff396519b6'),
(45, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 06:42:05', '2026-04-06 06:42:15', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '01f93f2b543462d0c59f4deb71c8b6fbd1ed0ceae1035f1e'),
(46, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:42:29', '2026-04-06 06:43:32', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a9e2343a8454ffd3c9515c47c228811f1c0a4cfcb27322f5'),
(47, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 06:45:01', '2026-04-06 06:45:36', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '921dcdc13664a4e7865f4d6c4b0bdb429a368303aae63f75'),
(48, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:45:46', '2026-04-06 06:49:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '9d248503feaab08d4cf8bc774c15ef2974fd8fc8c825b685'),
(49, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 06:59:24', '2026-04-06 07:02:12', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7a0ec5a755bc4d43810959787b89bf22262ccca974b2a3ca'),
(50, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 07:03:36', '2026-04-06 07:09:29', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '4186fe66cdb9586fb700115c1f2365290764619514e5915e'),
(51, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 09:32:26', '2026-04-06 09:38:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a1d4deb79c6444e41144fac114dc422be4845b491b389f26'),
(52, 3, 'harijiem@gmail.com', 'moderator', '2026-04-06 09:38:50', '2026-04-06 09:39:23', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '162e34de4440332729b44b9a055c72192e3c472a01a0c9e8'),
(53, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 09:39:37', '2026-04-06 09:40:12', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f929d335585d0814247ccf2cd9a0aa3a7a77eb0be4d12e6b'),
(54, 4, 'mharijie@gmail.com', 'customer', '2026-04-06 10:55:13', NULL, 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '0c501b04fecae6dd90378afcc8ac60b21488b20121eb1549'),
(55, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-06 10:56:10', '2026-04-06 11:02:57', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd3061bb1dd655d83ff91fa65486a035eac15403bf9dd710f'),
(56, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 00:14:16', '2026-04-08 00:15:17', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b19dfc7fa01b023ca7f86a1c2285b9b20f16e453ad7b7c94'),
(57, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 00:23:21', '2026-04-08 00:24:17', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '6572a0c0d751f08302db7f3f4b4d1113ab46c08edf815314'),
(58, 4, 'mharijie@gmail.com', 'customer', '2026-04-08 00:24:36', '2026-04-08 00:25:17', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'e1ae4d65405d18b80c189b669091aa88556c11122d7c420c'),
(59, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 00:25:37', '2026-04-08 00:29:22', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '41f633f3069a94e84577fb5ff4c5de11101d8b6859a49d6a'),
(60, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 00:46:17', '2026-04-08 00:48:53', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'dde21296df95e74e2fc9b00f3a22ee5f0cd9f3329118b9d1'),
(61, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 00:54:57', '2026-04-08 00:57:24', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '8b2454f88c4edc7fde809d893ed10207cbc1251cca72213b'),
(62, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 01:05:48', '2026-04-08 01:07:31', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'fa591ef870cc036c67e91f66cb6cb69e83724848557c2f9e'),
(63, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 01:13:24', '2026-04-08 01:14:13', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'ad07253519b7c83b101f1affdc274852e903c96f64b40287'),
(64, 4, 'mharijie@gmail.com', 'customer', '2026-04-08 01:14:25', '2026-04-08 01:18:12', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '77f05e10c98d1978d280bb73a5d826df482c74845c2247b4'),
(65, 4, 'mharijie@gmail.com', 'customer', '2026-04-08 01:34:43', '2026-04-08 01:37:42', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '143b4ade5865f1eedd93b19cfb75b4b6f063bdca378f8120'),
(66, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-08 23:25:08', '2026-04-08 23:29:42', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '2515c4fc89adee38b8b4d6f9ec499247b327e63f00954987'),
(67, 4, 'mharijie@gmail.com', 'customer', '2026-04-08 23:29:54', '2026-04-08 23:32:57', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7099fa6ff3e1fabf91cfdbc9988f21f946e1d537b1ae5a07'),
(68, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-09 22:26:36', '2026-04-09 22:27:04', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '78bbfafe9028a1111202ba24eb7613769ecc68ed235356d1'),
(69, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 22:27:19', '2026-04-09 22:31:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd189fad9be355452030239189ee4a448397227801c2f650a'),
(70, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-09 22:57:39', '2026-04-09 22:57:54', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '5614b659f3ac2495f25f3f1a9214e98477f4f6a277ee5a6a'),
(71, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 22:58:06', '2026-04-09 23:04:56', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '12b6c57f451939c215c70859e7ccd6c828d1bef7f1c44a55'),
(72, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:07:26', '2026-04-09 23:11:53', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd7a0149f7fa7d87d19ddf003e5d45062640f909117964137'),
(73, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-09 23:12:12', '2026-04-09 23:13:38', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bbcbe3257ebd63b9d678541aff61b75bed57126dbc2abcaf'),
(74, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:18:25', '2026-04-09 23:23:08', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '9293b1bec23c2b9bdcddc58b81a4cd2b5bcbf243e5624c16'),
(75, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-09 23:26:00', '2026-04-09 23:26:24', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '194770baa6c0e7e61b312578b2b585fa7ae52bc4aa0e3221'),
(76, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:26:35', '2026-04-09 23:28:26', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f5f75d14e486e5954f20b0d2b333429b897bafc28a9bea5d'),
(77, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:30:38', '2026-04-09 23:35:15', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bf89a62cb14524015a2af67c24b006e7b838ed90410e0a8a'),
(78, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:39:17', '2026-04-09 23:42:06', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'e7dd85892ec3b8442dfb8972f89211a4a99948d9cdf415a7'),
(79, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:46:19', '2026-04-09 23:48:39', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '8058106b192311a1ee9b35415c4729a554407c606dfae49a'),
(80, 4, 'mharijie@gmail.com', 'customer', '2026-04-09 23:55:31', '2026-04-09 23:56:34', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '4ebe47301a3f9e93f2e0c02046f7527774623e3dc67f7a07'),
(81, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 00:00:20', '2026-04-10 00:00:27', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a5678d1b6dc98fa26c47b8852cb55778e578bd22efbb57dd'),
(82, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 00:00:42', '2026-04-10 00:00:54', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'e0d5782c97c6971628cc659764c05c884e20ef4acdeef546'),
(83, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 00:05:49', '2026-04-10 00:09:30', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bea59bb6335084e02c230efac42924359addfa6039ce0b2e'),
(84, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 00:12:14', '2026-04-10 00:13:10', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a9a0964db47d2b5905703d0188b1cc0638f0d69cafae9d43'),
(85, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 00:15:24', '2026-04-10 00:17:02', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '90e0ae8dcc3b6121e16ada462471c623002a30998ec1a84b'),
(86, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 00:21:17', '2026-04-10 00:21:44', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '493cc1636a13cfba18bc880189f583067ff89660b62ed2f0'),
(87, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 08:32:15', '2026-04-10 08:33:42', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '02237432bf9f106bd3ec32b9d98f11008c0b0d566c220595'),
(88, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 08:36:14', '2026-04-10 08:38:42', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '3c8095cb617b7443f5d95697c0a84891c11082e19960cf64'),
(89, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 08:48:06', '2026-04-10 08:52:58', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7430d7598e9330ad90b904c7d0224092919b8dacc64cc08a'),
(90, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 08:57:24', '2026-04-10 08:58:29', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7dd2f06adb5418afa68ad0e5b579e00ede595cb8d188c027'),
(91, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 09:01:37', '2026-04-10 09:02:28', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b1a0b5545966ccfb2c70143b218eae96ca8f3c2838e1f0ef'),
(92, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 09:06:44', '2026-04-10 09:07:18', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd7285d10a7bde11abd22bcf93acb18ab72ce78162f0619ce'),
(93, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:07:44', '2026-04-10 09:10:01', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '45f74b69400296ff9e69a25d898db7948441a242e005d8d7'),
(94, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:16:50', '2026-04-10 09:17:41', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '4cb2159fbed93bb06d94cb20998149fbd24cb791308c0015'),
(95, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:21:25', '2026-04-10 09:24:17', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 'f92dd286ca2e681004ddad33d21610944d64d8e53c0995ee'),
(96, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:27:19', '2026-04-10 09:30:35', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b1ea917bbe498a5bdf1c894870c7ba941b4ff400306d9fc5'),
(97, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:33:32', '2026-04-10 09:36:58', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '367d11dee90785aad16210aad941342b6ef9c4ac8c24e685'),
(98, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:55:32', '2026-04-10 09:56:10', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '02d080a463f411300aa639df2a3c3210d0865ae199cedf92'),
(99, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 09:56:25', '2026-04-10 09:58:48', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '4dd76650f8cc72deacdff85eeb1ff4a19f0141f1b3b64541'),
(100, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 09:59:01', '2026-04-10 09:59:51', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd1dc03dc68c4e9e6d21d6b236d52516a7454403ed526ee88'),
(101, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:14:05', '2026-04-10 10:14:55', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'abb7fd2ebd5875ea75d959d7dc6adf864b0e2cdb3b852391'),
(102, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:15:09', '2026-04-10 10:17:00', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f26510c3c6ee41faf0b6d5eeca601fcc847728c5a56474c3'),
(103, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:21:40', '2026-04-10 10:22:39', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a15352986ddf1ba2b0059f9699e4da8bb2ac71e0804e4c83'),
(104, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:23:45', '2026-04-10 10:24:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'a869d69469f7383a1b15ed88dc38080da9da4be988cfa739'),
(105, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:27:45', '2026-04-10 10:28:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '04637fe3583bdf24a435b00d3c61f9bfa9501708304ab54d'),
(106, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:29:16', '2026-04-10 10:29:34', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '98e4d82edea22ae5fb0277d61a289df15697c15869f1046b'),
(107, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:33:28', '2026-04-10 10:33:37', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '76a2c32464a635bfc1c32f51ac1c105bda8960c1c82252a9'),
(108, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:33:52', '2026-04-10 10:34:05', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'c08571ddd42bf70613fc47c749f006f0d647d3de99798341'),
(109, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:34:18', '2026-04-10 10:34:50', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '25255bb54d7983db80b3c94a3e0ec591c58140768f6f2a10'),
(110, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:35:08', '2026-04-10 10:35:20', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '8645eac8cec14968e959d87fb93f848796c8ad758d03d842'),
(111, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:35:33', '2026-04-10 10:36:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '819b1a014f0efa8efdb12c58b8efc82d8bfdaa28f7fcb2f2'),
(112, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:42:32', '2026-04-10 10:44:32', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '991da7f375f97b4459ce757ffe2a61ad6120af2e4509b153'),
(113, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 10:46:22', '2026-04-10 10:47:03', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '707abebf6c9b5474e13beddbf812f857106d2ffe043feafa'),
(114, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 10:52:40', '2026-04-10 10:56:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '94b19593ed6075cb634b9e80dd00f73e791d7045e42be646'),
(115, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 11:00:56', '2026-04-10 11:02:29', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '45afae6f0ecdd5d37089cbe20cc825f6cdfcd8bef5189a41'),
(116, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 11:12:30', '2026-04-10 11:19:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '906441ddf406dea491d688a637b7c9ff5867400a2f3c0af5'),
(117, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 11:20:11', '2026-04-10 11:21:05', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd31bb845cf4f6d1d7062d5bca3c366a50678c1af3c8c7b83'),
(118, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 11:22:01', '2026-04-10 11:25:06', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'f9e3f4a75cd4ee2b0e2b5a28caaf656bb9866c5ef2f33568'),
(119, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 11:48:11', '2026-04-10 11:48:39', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'e48f5d91595e59a0a7596aec28fd2966a3a5b92d75430552'),
(120, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 11:48:53', '2026-04-10 11:53:05', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'dc749639ce36353809cef209dbe74f390cb654b509fb68d0'),
(121, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 11:53:20', '2026-04-10 11:53:57', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '1c1ecf148b370b8e747e4de5c4ef2051a3d77852f3d76952'),
(122, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 11:54:10', '2026-04-10 11:54:38', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '7a6cb97d0c9e16166bfade08a00308a27c1f703aeacc6935'),
(123, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 12:19:08', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '5f363f73091189b38eae320262796224dde82c76d208b5de'),
(124, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 12:19:47', NULL, 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '2ce2c81419f68130e26b4c76a4c18a5d09c5c394984c88a1'),
(125, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 12:24:07', '2026-04-10 12:25:26', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '199d1660f9571dc089c8751579a22a2e7a9401be9035bf4a'),
(126, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 12:25:50', '2026-04-10 12:26:30', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '2b2770b2e00ed969d7ef0df4df92bd44323fabdbfd890339'),
(127, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 12:26:44', '2026-04-10 12:26:57', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'e11dfb9264f300fed4314fa05ad2699d4ecc44811706466a'),
(128, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 12:35:59', '2026-04-10 12:36:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '6372abe2d365a26bea97fc151975b737a9ecbcb1e3477827'),
(129, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 12:37:18', '2026-04-10 12:37:42', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '10529867450c6e9aaa1e02c90fc6fbfef81b241b580995bb'),
(130, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 12:41:07', '2026-04-10 12:42:32', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd59b1475c6d7303229b5a8d615910f02d7d05a3b30e3905a'),
(131, 2, 'tongtongornamental@gmail.com', 'admin', '2026-04-10 12:42:55', '2026-04-10 12:43:59', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', '59e911898b5b135c4b46d50b0a29535952ffeaa945d5870c'),
(132, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 12:49:27', '2026-04-10 12:49:36', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'd2e2d03bcd3fdcb96e6b4347bdccff24f29d82d5a93ac245'),
(133, 4, 'mharijie@gmail.com', 'customer', '2026-04-10 22:37:08', '2026-04-10 22:38:21', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'bd5a8e619a425cfb314463f1d9c81ecacfcb9af861390e2b'),
(134, 3, 'harijiem@gmail.com', 'moderator', '2026-04-10 22:38:36', '2026-04-10 22:39:36', 1, '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0', 'b17cd46d2062b56608e7637351673f257e86574fcf7403ea');

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
-- Indexes for table `transaction_logs`
--
ALTER TABLE `transaction_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_transaction_logs_order_id` (`order_id`),
  ADD KEY `idx_transaction_logs_created_at` (`created_at`),
  ADD KEY `idx_transaction_logs_processed_by_user_id` (`processed_by_user_id`);

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
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoice_requests`
--
ALTER TABLE `invoice_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_cancellation_requests`
--
ALTER TABLE `order_cancellation_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transaction_logs`
--
ALTER TABLE `transaction_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_session_logs`
--
ALTER TABLE `user_session_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

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
