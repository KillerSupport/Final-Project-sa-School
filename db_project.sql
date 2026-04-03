-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 27, 2026 at 04:46 PM
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
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `invoice_pdf_path` varchar(500) DEFAULT NULL,
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
  `pet_care_content` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `image_url` varchar(500) DEFAULT NULL,
  `compatibility` text DEFAULT NULL,
  `care_difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `lifespan` varchar(100) DEFAULT NULL,
  `diet` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`, `pet_care_content`, `category`, `price`, `stock`, `low_stock_threshold`, `image_url`, `compatibility`, `care_difficulty`, `lifespan`, `diet`, `is_deleted`, `created_at`, `updated_at`) VALUES
(1, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:51', '2026-03-27 15:41:51'),
(2, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:54', '2026-03-27 15:41:54'),
(3, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:56', '2026-03-27 15:41:56'),
(4, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:57', '2026-03-27 15:41:57'),
(5, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:57', '2026-03-27 15:41:57'),
(6, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:58', '2026-03-27 15:41:58'),
(7, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:59', '2026-03-27 15:41:59'),
(8, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:59', '2026-03-27 15:41:59'),
(9, 'Clown Fish', 'Nemo', '', 'Saltwater', 105.00, 26, 5, 'http://localhost:5000/uploads/1774626108477-299550616.jpg', 'Mabait', 'beginner', '3 years', 'kain lang', 0, '2026-03-27 15:41:59', '2026-03-27 15:41:59');

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
(1, 'Hatsune', '', 'Miku', '', '2007-08-31', 'Female', '09123456789', 'Japan', 'harijie.mabilin@cvsu.edu.ph', 'HatsuneMiku39', 1, 'client', 1, NULL, NULL, 0, 0, 0, 0, NULL, '2026-03-18 12:33:18', 0),
(2, 'TongTong', '', 'Fish', '', '1111-11-11', 'Fish', '09123456789', 'Imus', 'tongtongornamental@gmail.com', '$2b$10$tV3Fb/mpb6R2QL9cqqQg0OkpOKh8nO.KF04NtQX9yHWuFh5Lmy6CC', 2, 'admin', 1, NULL, NULL, 0, 0, 0, 0, NULL, '2026-03-18 12:34:27', 0),
(3, 'Harijie', '', 'Mabilin', '', '2004-07-15', 'Male', '09987654321', 'bacoor', 'harijiem@gmail.com', '$2b$10$VMiuUOPIR7NmWRb0gpZAwem2RbakIdmm/ZbxVqi0W8nddmt5ygFY.', 3, 'worker', 1, NULL, NULL, 0, 0, 0, 0, NULL, '2026-03-18 12:35:18', 0),
(4, 'Megurine', '', 'Luka', '', '2009-01-30', 'Female', '09123456789', 'Japan', 'mharijie@gmail.com', 'testlangE2', 1, 'client', 0, '9045', '2026-03-20 22:53:04', 0, 0, 0, 0, NULL, '2026-03-20 14:35:15', 0);

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
  ADD PRIMARY KEY (`product_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
