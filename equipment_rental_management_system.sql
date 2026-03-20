-- phpMyAdmin SQL Dump
-- version 5.0.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2026 at 07:22 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `equipment_rental_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Power Tools', 'Professional-grade power tools for all your construction needs', '2025-10-29 14:01:43'),
(2, 'Heavy Equipment', 'Manual tools for various tasks', '2025-10-29 14:01:43'),
(3, 'Construction', 'Heavy-duty construction machinery and equipment rentals', '2025-10-29 14:01:43'),
(4, 'Lawn & Garden', 'Garden tools and equipment for landscaping and maintenance', '2025-10-29 14:01:43'),
(5, 'Party & Events', 'Event equipment and supplies for celebrations and gatherings\r\n', '2025-10-29 14:01:43'),
(6, 'Others', 'Everything else', '2025-10-29 14:01:43'),
(7, 'Hand Tools', 'Essential hand tools for precision work and repairs', '2026-01-12 09:53:49');

-- --------------------------------------------------------

--
-- Table structure for table `damage_reports`
--

CREATE TABLE `damage_reports` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `reported_by` int(11) NOT NULL,
  `damage_description` text NOT NULL,
  `severity_level` enum('minor','moderate','severe','critical','major') DEFAULT 'minor',
  `estimated_cost` decimal(10,2) DEFAULT 0.00,
  `image_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_urls`)),
  `status` enum('pending','under_review','approved','rejected','repaired') DEFAULT 'pending',
  `repair_notes` text DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `damage_reports`
--

INSERT INTO `damage_reports` (`id`, `rental_id`, `reported_by`, `damage_description`, `severity_level`, `estimated_cost`, `image_urls`, `status`, `repair_notes`, `actual_cost`, `created_at`, `updated_at`) VALUES
(6, 23, 6, 'Minor scratches on excavator bucket', 'minor', '150.00', NULL, 'approved', 'Polished and repainted scratches', '120.00', '2025-11-15 19:18:14', '2025-11-16 10:06:09'),
(7, 24, 6, 'Heavy wear on excavator tracks', 'moderate', '800.00', NULL, 'approved', 'Track replacement scheduled', '750.00', '2025-11-15 19:18:14', '2025-11-16 09:05:48'),
(8, 25, 6, 'Drill bit broken during use', 'minor', '25.00', NULL, 'repaired', 'Replaced drill bit', '20.00', '2025-11-15 19:18:14', '2025-11-16 09:05:53'),
(9, 26, 6, 'Lawn mower blade dull', 'minor', '50.00', NULL, 'repaired', 'Blade sharpening required', '0.00', '2025-11-15 19:18:14', '2025-11-16 10:06:18'),
(10, 27, 6, 'Concrete mixer motor bearing noise', 'moderate', '200.00', NULL, 'approved', 'Bearing inspection needed', '0.00', '2025-11-15 19:18:14', '2025-11-16 10:07:11'),
(11, 25, 6, 'lpoiufsiopl[;df fsdpokjlsmd ,fsdop[sdl', 'minor', '90.00', '[\"uploads/damage-reports/damage_1763283735684_1ovh2tl4l.jpg\"]', 'repaired', NULL, '0.00', '2025-11-16 09:02:15', '2025-11-16 15:41:46'),
(13, 36, 6, 'jhgfds dfghjkl; hg. ertyuio fghjkl,ghjkl', 'minor', '50.00', '[\"uploads/damage-reports/damage_1763296249362_0of19chnp.jpg\",\"uploads/damage-reports/damage_1763296249364_eqcw2lfuu.jpg\",\"uploads/damage-reports/damage_1763296249365_36akynawl.jpg\"]', 'approved', NULL, '70.00', '2025-11-16 12:30:49', '2025-11-16 15:41:53'),
(14, 38, 7, 'oiuytrfdghj dfghjk cfghjkljhg', 'moderate', '78.00', '[]', 'pending', NULL, '0.00', '2025-11-16 16:49:05', '2025-11-16 16:49:05'),
(15, 24, 6, 'lkjnmsd skjans', 'moderate', '45.00', '[]', 'pending', NULL, '0.00', '2025-11-16 18:25:12', '2025-11-16 18:25:12'),
(16, 32, 6, 'klsjs', 'moderate', '62762.00', '[]', 'pending', NULL, '0.00', '2025-11-16 19:16:34', '2025-11-16 19:16:34'),
(17, 40, 6, 'iuashn', 'minor', '0.00', '[]', 'pending', NULL, '0.00', '2025-11-16 19:17:00', '2025-11-16 19:17:00'),
(18, 41, 6, 'kkjhgfc fg hjkl ghjkl', 'minor', '10.05', '[]', 'pending', NULL, '0.00', '2025-11-17 08:10:57', '2025-11-17 08:10:57'),
(19, 41, 6, 'klkjhgb hjjkl; iop[', 'critical', '0.00', '[\"uploads/damage-reports/damage_1763367091587_x49k5hx40.jpg\",\"uploads/damage-reports/damage_1763367091591_f1pcazehg.jpg\",\"uploads/damage-reports/damage_1763367091592_krx89wwvg.jpg\",\"uploads/damage-reports/damage_1763367091593_b1b8wlq2t.jpg\"]', 'pending', NULL, '0.00', '2025-11-17 08:11:31', '2025-11-17 08:11:31'),
(20, 40, 6, 'mjhgf jkuyjfgc kjhgfvc', 'moderate', '67.88', '[]', 'pending', NULL, '0.00', '2025-11-20 08:02:57', '2025-11-20 08:02:57'),
(21, 37, 6, 'mn hjbv kjhbv ', 'moderate', '150.00', '[]', 'pending', NULL, '0.00', '2025-11-20 08:08:50', '2025-11-20 08:08:50'),
(22, 43, 6, 'kjhgfc iujghfcv', 'moderate', '7895.00', '[]', 'pending', NULL, '0.00', '2025-11-20 08:14:57', '2025-11-20 08:14:57'),
(23, 44, 6, 'mnb ', 'minor', '99.00', '[]', 'pending', NULL, '0.00', '2025-11-20 08:38:10', '2025-11-20 08:38:10'),
(24, 40, 6, 'jhasjksa', 'minor', '78.00', '[]', 'pending', NULL, '0.00', '2025-11-20 10:26:07', '2025-11-20 10:26:07'),
(25, 40, 6, 'kjhgfcx kjhgfc lkjhgbc ', 'moderate', '120.00', '[]', 'pending', NULL, '100.00', '2025-11-20 10:44:41', '2025-11-20 10:44:41'),
(26, 37, 6, 'lkjhbn', 'minor', '78.00', '[]', 'pending', NULL, '90.00', '2025-11-20 10:49:44', '2025-11-20 10:49:44'),
(27, 28, 6, '..jb ;lkljbn ;l;nmb lkjb nlkljbn lkjkbn ;lkjk ', 'moderate', '54.00', '[\"uploads/damage-reports/damage_1763642134049_bkj311h92.jpg\"]', 'pending', NULL, '70.00', '2025-11-20 12:35:34', '2025-11-20 12:35:34'),
(28, 38, 6, 'mnbcvx', 'minor', '98.00', '[]', 'pending', NULL, '200.00', '2025-11-20 12:50:18', '2025-11-20 12:50:18'),
(29, 36, 6, 'poiuhjg', 'moderate', '89.00', '[]', 'repaired', '', '89.97', '2025-11-21 12:11:51', '2025-11-21 18:34:13'),
(31, 27, 6, '][p;lkmn ', 'minor', '89.00', '[]', 'approved', '', '120.00', '2025-11-22 04:13:25', '2025-11-22 04:15:35'),
(32, 43, 6, 'lkjn', 'major', '67.00', '[]', 'pending', NULL, '80.00', '2025-11-22 04:28:09', '2025-11-22 04:28:09'),
(33, 24, 6, '.m,', 'minor', '789.00', '[]', 'pending', NULL, '500.00', '2025-11-22 04:29:57', '2025-11-22 04:29:57'),
(34, 44, 7, '\';lm, .ll ', 'moderate', '78.00', '[]', 'pending', NULL, '50.00', '2025-11-22 04:32:49', '2025-11-22 04:32:49'),
(35, 44, 7, '\r\n\';lknmnm,./', 'minor', '88.00', '[]', 'pending', NULL, '120.00', '2025-11-22 04:34:23', '2025-11-22 04:34:23'),
(36, 44, 7, 'jkhgfcxvbnm,', 'major', '150.00', '[]', 'pending', NULL, '110.00', '2025-11-22 04:35:14', '2025-11-22 04:35:14'),
(37, 45, 6, '.lkjhb jbn jknb', 'major', '100.00', '[]', 'pending', '', '88.00', '2025-11-22 04:39:44', '2026-01-29 18:00:09'),
(38, 45, 6, ';lknmkloijknm km', 'minor', '88.00', '[]', 'pending', NULL, '70.00', '2025-11-22 04:40:11', '2025-11-22 04:40:11'),
(39, 45, 6, 'lkjhgcxvbnm,', 'critical', '700.00', '[]', 'pending', NULL, '888.00', '2025-11-22 04:40:46', '2025-11-22 04:40:46'),
(40, 45, 24, 'uieghgjbnhnbshj', 'moderate', '562.98', '[]', 'pending', NULL, '700.78', '2025-12-15 14:10:35', '2025-12-15 14:10:35'),
(42, 76, 7, 'kjds doids dijnd so', 'minor', '50.00', '[]', 'pending', NULL, '80.00', '2026-01-07 12:26:29', '2026-01-07 12:26:29'),
(43, 69, 6, 'kjhg kjhg jkhgb jhb kjhb', 'moderate', '82.00', '[]', 'pending', NULL, '500.00', '2026-01-09 08:45:48', '2026-01-09 08:45:48'),
(44, 85, 6, 'lkjhgc', 'minor', '9088.00', '[]', 'pending', NULL, '600.00', '2026-01-09 13:59:17', '2026-01-09 13:59:17'),
(45, 79, 6, 'plkj kjn kj', 'moderate', '87.00', '[]', 'repaired', NULL, '200.00', '2026-01-09 14:01:13', '2026-01-09 14:03:21'),
(46, 78, 6, ';\'spo;klj', 'moderate', '822.00', '[]', 'pending', NULL, '900.00', '2026-01-09 14:05:42', '2026-01-09 14:05:42'),
(47, 84, 6, 'lkj kj kljk lkjb jkbn', 'moderate', '50.00', '[]', 'pending', NULL, '60.00', '2026-01-10 17:43:44', '2026-01-10 17:43:44'),
(48, 77, 6, 'l;;lkjhbn ddflkm,n dgl;kmn dg;lkmdng ;dklgnm dgklm dfg', 'minor', '75.00', '[]', 'pending', NULL, '80.00', '2026-03-10 14:07:58', '2026-03-10 14:07:58');

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `daily_rate` decimal(10,2) NOT NULL,
  `condition` varchar(20) DEFAULT NULL,
  `location` varchar(20) DEFAULT NULL,
  `weekly_rate` decimal(10,2) DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `available_quantity` int(11) NOT NULL DEFAULT 1,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `under_maintenance` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `name`, `description`, `category_id`, `hourly_rate`, `daily_rate`, `condition`, `location`, `weekly_rate`, `monthly_rate`, `quantity`, `available_quantity`, `specifications`, `image_url`, `is_active`, `created_at`, `updated_at`, `under_maintenance`) VALUES
(1, 'De Walt Cordless Drill', '18V cordless drill with battery and charger', 1, NULL, '25.00', 'excellent', 'Mahwalala', NULL, NULL, 5, 1, '{\"brand\": \"DeWalt\", \"voltage\": \"18V\", \"battery_type\": \"Lithium-ion\", \"weight\": \"1.5kg\"}', '/uploads/products/equipment-1762326886469-233772525.jpg', 1, '2025-10-29 14:01:43', '2026-01-12 07:50:58', 0),
(2, 'Concrete Mixer', '5 cubic feet concrete mixer', 3, NULL, '85.00', 'excellent', 'Matsapha', NULL, NULL, 10, 10, '{\"capacity\": \"5 cubic feet\", \"power_source\": \"Electric\", \"weight\": \"45kg\"}', '/uploads/products/equipment-1762264256164-451382297.jpg', 1, '2025-10-29 14:01:43', '2026-03-12 13:52:56', 0),
(3, 'Lawn Mower', 'Self-propelled gas lawn mower', 4, NULL, '40.00', 'excellent', 'Bhunya', NULL, NULL, 4, 4, '{\"cutting_width\": \"21 inches\", \"engine\": \"190cc\", \"fuel_type\": \"Gasoline\"}', '/uploads/products/equipment-1762328837052-67426940.jpg', 1, '2025-10-29 14:01:43', '2026-01-09 07:17:47', 0),
(4, 'Pressure Washer', '2000 PSI electric pressure washer', 5, NULL, '35.00', 'excellent', 'Matsapha, Logoba', NULL, NULL, 6, 1, '{\"pressure\": \"2000 PSI\", \"flow_rate\": \"1.5 GPM\", \"power_source\": \"Electric\"}', '/uploads/products/equipment-1762329234276-361755862.jpg', 1, '2025-10-29 14:01:43', '2025-11-15 16:16:54', 0),
(5, 'Table Saw', '10-inch portable table saw', 1, NULL, '45.00', 'excellent', 'Mbabane', NULL, NULL, 2, 2, '{\"blade_diameter\": \"10 inches\", \"max_cut_depth\": \"3.5 inches\", \"weight\": \"25kg\"}', '/uploads/products/equipment-1763622180187-230328113.jpg', 1, '2025-10-29 14:01:43', '2025-11-22 04:50:27', 0),
(6, 'Hammer Drill', 'Heavy-duty hammer drill for concrete', 1, NULL, '30.00', 'excellent', 'Manzini, Zakhele', NULL, NULL, 4, 4, '{\"brand\": \"Bosch\", \"impact_rate\": \"48000 bpm\", \"power\": \"600W\"}', '/uploads/products/equipment-1762327072640-962514589.jpg', 1, '2025-10-29 14:01:43', '2026-01-12 10:33:10', 0),
(7, 'Angle Grinder', '4-1/2 inch angle grinder', 3, NULL, '21.98', 'excellent', 'jertyuijhg', NULL, NULL, 5, 1, '{\"disc_size\": \"4.5 inches\", \"speed\": \"11000 rpm\", \"power\": \"720W\"}', '/uploads/products/equipment-1762174653238-924311754.jpg', 1, '2025-10-29 14:01:43', '2026-01-29 18:03:32', 0),
(8, 'Circular Saw', '7-1/4 inch circular saw', 1, NULL, '28.00', 'excellent', '', NULL, NULL, 6, 2, '{\"blade_size\": \"7.25 inches\", \"depth_cut\": \"2.5 inches\", \"power\": \"1500W\"}', '/uploads/products/equipment-1762263867887-468671822.jpg', 1, '2025-10-29 14:01:43', '2026-01-10 17:56:47', 0),
(9, 'Bil-jax indoor/outdoor scaffolding tower – 30′ kit', 'Looking for a scaffolding tower rental? Our 30′ Bil-Jax Scaffolding Kit is perfect contractors, construction workers, and more. Ideal for tasks like construction work, painting, siding, and electrical work, it provides a safe and spacious working platform for those hard-to-reach areas.\r\n\r\nKey Features:\r\n\r\n    Simple Setup: One-person assembly with no tools required.\r\n    Sturdy Build: Made from strong round tube construction with a durable powder-coated finish.\r\n    Ample Space: 5′ x 5′ deck frame offers plenty of room to work.\r\n    Easy Mobility: Optional locking casters for easy movement and secure placement.\r\n    Safety First: Available with a full top deck guard rail for added security.\r\n\r\nCustomizable:\r\n\r\n    Additional rental pieces such as walking planks, wheels, leveling jacks, and safety rails to fit your specific needs.\r\n\r\nRental Includes:\r\n\r\n    Frames\r\n    Stacking pins\r\n    Gravity pigtail pins\r\n    Cross braces\r\n\r\nNote: Wheels, planks, leveling jacks, outriggers, and safety rails are available at an additional cost.\r\n\r\nDon’t wait, make your project easier and safer by renting our 30′ Bil Jax Scaffolding Kit today!', 3, NULL, '100.00', 'excellent', 'Mhlaleni', NULL, NULL, 1, 1, '{\"Weight Capacity\"	: \"10,000 lbs\",\r\n\"Frame Material\"	: \"Steel\",\r\n\"Total Weight\":\"975 lbs\",\r\n\"Walk Board Material\":\"Aluminum\",\r\n\"Working Height\":\"37 ft\",\r\n\"Range\":\"2 ft - 31 ft\"}', '/uploads/products/equipment-1762337806071-984507473.jpg', 1, '2025-11-05 10:16:46', '2026-03-10 14:06:38', 0),
(15, 'ljkhgfxcvbnm;kjhbv', ';lkjn;lkmklmn;lkjnm', 3, NULL, '90.00', 'excellent', 'mahamba', NULL, NULL, 100, 96, '{\"blade_size\": \"7.25 inches\", \"depth_cut\": \"2.5 inches\", \"power\": \"1500W\"}', '/uploads/products/equipment-1763622133384-713201568.jpg', 1, '2025-11-20 07:02:13', '2026-01-09 13:21:53', 0),
(16, 'kjkhgb', '.kljkmbn ', 5, NULL, '78.00', 'good', '.k,jmnb kjbn ', NULL, NULL, 100, 100, '{\"weight\" : \"2kg\"}', '/uploads/products/equipment-1767961573361-520411213.jpg', 1, '2026-01-09 12:26:13', '2026-01-09 12:26:13', 0),
(17, 'Flex Cordless Drill', 'Compact 2-speed cordless percussion drill 18 V', 1, NULL, '80.00', 'excellent', 'Matsapha', NULL, NULL, 10, 0, '{\r\n\"Battery capacity\" : \"2,5 / 5,0 / 8,0 Ah\",\r\n\"Max. torque, hard \" : \"115 Nm\",\r\n\"Max. torque, soft\" : \"60 Nm\",\r\n\"Chuck clamping width\" : \"1.5-13 mm\",\r\n\"Max. drilling diameter in wood\" : \"68 mm\",\r\n\"Max. drilling diameter in stone\" : \"13 mm\",\r\n\"Max. drilling diameter in steel\" : \"13 mm\",\r\n\"Dimensions WxLxH\" : \"180 x 65 x 208 mm\",\r\n\"Weight without battery pack\" : \"1,50 kg\",\r\n\"Torque adjustment\" : \"22+1 Steps\",\r\n\"Sound pressure level\" : \"86 dB(A)\",\r\n\"Vibration\" : \"11,47 m/s²\"}', '/uploads/products/equipment-1768204149904-920989674.jpg', 1, '2026-01-12 07:49:09', '2026-01-12 10:39:46', 0);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance`
--

CREATE TABLE `maintenance` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `maintenance_date` date NOT NULL,
  `description` text NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `maintenance`
--

INSERT INTO `maintenance` (`id`, `equipment_id`, `maintenance_date`, `description`, `cost`, `performed_by`, `next_maintenance_date`, `created_at`) VALUES
(1, 1, '2026-03-18', 'mmjnbvgjjkl,m', '8.00', 'Goje', '2026-03-27', '2026-02-18 13:29:04'),
(2, 7, '2026-03-11', '/;lkjhvbb nmn,m.knjnmb lkjnm ;l;k,mn lkjnm lkjnm ', '78.00', 'Sbuda', '2026-04-29', '2026-03-09 13:37:41');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('card','ewallet','mobile_money') DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `rental_id`, `amount`, `payment_method`, `payment_status`, `stripe_payment_intent_id`, `created_at`) VALUES
(11, 59, '28.00', '', 'completed', 'pi_3Sh9uiED0MIyazML1dQhZKeW', '2025-12-22 14:16:46'),
(12, 73, '84.00', '', 'completed', 'mock_fallback_pi_1766422433340', '2025-12-22 16:53:56'),
(13, 74, '56.00', '', 'pending', 'mock_fallback_pi_1766423204980', '2025-12-22 17:06:48'),
(14, 75, '255.00', '', 'pending', 'mock_fallback_pi_1766423416068', '2025-12-22 17:10:19'),
(15, 76, '400.00', '', 'completed', 'mock_fallback_pi_1766424205708', '2025-12-22 17:23:28'),
(16, 77, '200.00', '', 'completed', 'pi_3SmxSHED0MIyazML1DAuK0gv', '2026-01-07 14:11:24'),
(17, 78, '168.00', '', 'completed', 'pi_3SnZ3uED0MIyazML0H5Zzl0R', '2026-01-09 06:20:45'),
(18, 79, '360.00', '', 'completed', 'pi_3SnZUPED0MIyazML0MrjSVbq', '2026-01-09 06:48:08'),
(19, 80, '240.00', '', 'completed', 'pi_3SnZXxED0MIyazML1GixvpSa', '2026-01-09 06:51:48'),
(20, 81, '160.00', '', 'completed', 'pi_3Snb60ED0MIyazML0ebXGBlx', '2026-01-09 08:31:02'),
(21, 82, '135.00', 'ewallet', 'completed', 'pi_3SnbB6ED0MIyazML13D07glT', '2026-01-09 08:36:18'),
(22, 83, '35.00', '', 'completed', 'pi_3SnbCgED0MIyazML0HVuF0xG', '2026-01-09 08:37:57'),
(23, 84, '510.00', 'mobile_money', 'completed', 'pi_3SnbEZED0MIyazML0XNf7JNd', '2026-01-09 08:39:54'),
(24, 85, '340.00', 'card', 'completed', 'pi_3SnbFNED0MIyazML0tzAHQNt', '2026-01-09 08:40:43'),
(25, 86, '2400.00', 'mobile_money', 'completed', 'mock_fallback_pi_1768214268345', '2026-01-12 10:37:51');

-- --------------------------------------------------------

--
-- Table structure for table `penalties`
--

CREATE TABLE `penalties` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `penalty_type` enum('late_return','damage','loss','other') DEFAULT 'late_return',
  `amount` decimal(10,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `penalties`
--

INSERT INTO `penalties` (`id`, `rental_id`, `penalty_type`, `amount`, `reason`, `applied_at`, `paid_at`, `payment_method`, `created_at`, `updated_at`) VALUES
(11, 23, 'late_return', '100.00', 'Equipment returned 2 hours late', '2025-11-15 19:19:01', '2024-01-05 16:00:00', 'cash', '2025-11-15 19:19:01', '2025-11-15 19:32:11'),
(12, 24, 'damage', '750.00', 'Track wear and tear beyond normal use', '2025-11-15 19:19:01', '2024-02-21 08:00:00', 'card', '2025-11-15 19:19:01', '2025-11-15 19:32:16'),
(13, 25, 'other', '25.00', 'Lost drill accessories', '2025-11-15 19:19:01', '2024-01-12 15:00:00', 'cash', '2025-11-15 19:19:01', '2025-11-15 19:32:23'),
(14, 26, 'late_return', '30.00', 'Returned 1 day late', '2025-11-15 19:19:01', '2024-02-04 07:00:00', 'card', '2025-11-15 19:19:01', '2025-11-15 19:32:28'),
(15, 27, 'damage', '150.00', 'Motor bearing replacement', '2025-11-15 19:19:01', NULL, NULL, '2025-11-15 19:19:01', '2025-11-15 19:32:33'),
(16, 40, 'damage', '100.00', 'Damage repair cost: kjhgfcx kjhgfc lkjhgbc ', '2025-11-20 10:44:41', '2025-12-22 13:59:06', 'card', '2025-11-20 10:44:41', '2025-12-22 13:59:06'),
(17, 37, 'damage', '90.00', 'Damage repair cost: lkjhbn', '2025-11-20 10:49:44', NULL, NULL, '2025-11-20 10:49:44', '2025-11-20 10:49:44'),
(18, 28, 'late_return', '135.00', 'Late return penalty: 3 days overdue at $45.00 per day', '2025-11-20 11:01:38', NULL, NULL, '2025-11-20 11:01:38', '2025-11-20 11:01:38'),
(19, 28, 'damage', '70.00', 'Damage repair cost: ..jb ;lkljbn ;l;nmb lkjb nlkljbn lkjkbn ;lkjk ', '2025-11-20 12:35:34', NULL, NULL, '2025-11-20 12:35:34', '2025-11-20 12:35:34'),
(20, 38, 'damage', '200.00', 'Damage repair cost: mnbcvx', '2025-11-20 12:50:18', '2025-12-22 14:03:24', 'card', '2025-11-20 12:50:18', '2025-12-22 14:03:24'),
(21, 36, 'late_return', '240.00', 'Late return penalty: 4 days overdue at $60.00 per day', '2025-11-21 12:11:20', NULL, NULL, '2025-11-21 12:11:20', '2025-11-21 12:11:20'),
(22, 36, 'damage', '90.00', 'Damage repair cost: poiuhjg', '2025-11-21 12:11:51', NULL, NULL, '2025-11-21 12:11:51', '2025-11-21 12:11:51'),
(23, 43, 'damage', '80.00', 'Damage repair cost: lkjn', '2025-11-22 04:28:09', NULL, NULL, '2025-11-22 04:28:09', '2025-11-22 04:28:09'),
(24, 24, 'damage', '500.00', 'Damage repair cost: .m,', '2025-11-22 04:29:57', '2026-01-07 12:23:56', 'card', '2025-11-22 04:29:57', '2026-01-07 12:23:56'),
(25, 44, 'damage', '50.00', 'Damage repair cost: \';lm, .ll ', '2025-11-22 04:32:49', '2025-12-22 13:58:45', 'card', '2025-11-22 04:32:49', '2025-12-22 13:58:45'),
(26, 45, 'damage', '88.00', 'Damage repair cost: .lkjhb jbn jknb', '2025-11-22 04:39:44', '2025-12-22 13:58:28', 'card', '2025-11-22 04:39:44', '2025-12-22 13:58:28'),
(27, 30, 'late_return', '750.00', 'Late return penalty: 5 days overdue at $150.00 per day', '2025-11-22 05:08:10', NULL, NULL, '2025-11-22 05:08:10', '2025-11-22 05:08:10'),
(28, 31, 'late_return', '450.00', 'Late return penalty: 3 days overdue at $150.00 per day', '2025-11-22 05:17:43', NULL, NULL, '2025-11-22 05:17:43', '2025-11-22 05:17:43'),
(30, 76, 'damage', '80.00', 'Damage repair cost: kjds doids dijnd so', '2026-01-07 12:26:29', '2026-01-07 12:26:38', 'card', '2026-01-07 12:26:29', '2026-01-07 12:26:38'),
(31, 69, 'damage', '500.00', 'Damage repair cost: kjhg kjhg jkhgb jhb kjhb', '2026-01-09 08:45:48', '2026-01-09 08:45:54', 'card', '2026-01-09 08:45:48', '2026-01-09 08:45:54'),
(32, 45, 'damage', '88.00', 'Damage repair cost: .lkjhb jbn jknb', '2026-01-09 13:01:45', NULL, NULL, '2026-01-09 13:01:45', '2026-01-09 13:01:45'),
(33, 85, 'damage', '600.00', 'Damage repair cost: lkjhgc', '2026-01-09 13:59:17', '2026-01-09 13:59:23', 'card', '2026-01-09 13:59:17', '2026-01-09 13:59:23'),
(34, 79, 'damage', '200.00', 'Damage repair cost: plkj kjn kj', '2026-01-09 14:01:13', '2026-01-09 14:01:21', 'card', '2026-01-09 14:01:13', '2026-01-09 14:01:21'),
(35, 78, 'damage', '900.00', 'Damage repair cost: ;\'spo;klj', '2026-01-09 14:05:43', '2026-01-09 14:05:55', 'card', '2026-01-09 14:05:43', '2026-01-09 14:05:55'),
(36, 84, 'damage', '60.00', 'Damage repair cost: lkj kj kljk lkjb jkbn', '2026-01-10 17:43:44', '2026-01-10 17:44:09', 'card', '2026-01-10 17:43:44', '2026-01-10 17:44:09'),
(37, 74, 'late_return', '672.00', 'Late return penalty: 16 days overdue at $42.00 per day', '2026-01-10 17:56:47', '2026-01-10 17:57:05', 'card', '2026-01-10 17:56:47', '2026-01-10 17:57:05'),
(38, 77, 'late_return', '9000.00', 'Late return penalty: 60 days overdue at $150.00 per day', '2026-03-10 14:06:38', '2026-03-10 14:08:24', 'card', '2026-03-10 14:06:38', '2026-03-10 14:08:24'),
(39, 77, 'damage', '80.00', 'Damage repair cost: l;;lkjhbn ddflkm,n dgl;kmn dg;lkmdng ;dklgnm dgklm dfg', '2026-03-10 14:07:58', '2026-03-10 14:08:36', 'card', '2026-03-10 14:07:58', '2026-03-10 14:08:36'),
(40, 85, 'late_return', '5610.00', 'Late return penalty: 44 days overdue at $127.50 per day', '2026-03-12 13:52:56', '2026-03-12 13:53:47', 'card', '2026-03-12 13:52:56', '2026-03-12 13:53:47');

-- --------------------------------------------------------

--
-- Table structure for table `pickup_returns`
--

CREATE TABLE `pickup_returns` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `pickup_staff_id` int(11) DEFAULT NULL,
  `return_staff_id` int(11) DEFAULT NULL,
  `pickup_datetime` timestamp NULL DEFAULT NULL,
  `return_datetime` timestamp NULL DEFAULT NULL,
  `pickup_notes` text DEFAULT NULL,
  `return_notes` text DEFAULT NULL,
  `condition_on_pickup` enum('excellent','good','fair','poor') DEFAULT 'good',
  `condition_on_return` enum('excellent','good','fair','poor') DEFAULT 'good',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `pickup_returns`
--

INSERT INTO `pickup_returns` (`id`, `rental_id`, `pickup_staff_id`, `return_staff_id`, `pickup_datetime`, `return_datetime`, `pickup_notes`, `return_notes`, `condition_on_pickup`, `condition_on_return`, `created_at`, `updated_at`) VALUES
(21, 23, 2, 2, '2024-01-01 08:00:00', '2024-01-05 15:00:00', 'Equipment picked up in excellent condition', 'Returned in good condition, minor usage marks', 'excellent', 'good', '2025-11-15 19:22:10', '2025-11-15 19:32:49'),
(22, 24, 2, 2, '2024-01-10 12:30:00', '2024-01-12 14:00:00', 'Drill machine inspected and cleaned', 'Returned with normal wear', 'good', 'good', '2025-11-15 19:22:10', '2025-11-15 19:32:54'),
(23, 25, 2, 2, '2024-02-01 07:15:00', '2024-02-03 16:30:00', 'Lawn mower fueled and ready', 'Returned with grass clippings cleaned', 'excellent', 'good', '2025-11-15 19:22:10', '2025-11-15 19:33:03'),
(24, 26, 2, 2, '2024-02-15 14:45:00', '2024-02-20 13:30:00', 'Excavator maintenance check completed', 'Heavy usage but no damage', 'good', 'fair', '2025-11-15 19:22:10', '2025-11-15 19:33:09'),
(25, 27, 2, 2, '2024-03-01 09:20:00', '2024-03-02 12:00:00', 'Concrete mixer inspected for safety', 'Returned with concrete residue cleaned', 'good', 'good', '2025-11-15 19:22:10', '2025-11-15 19:33:15'),
(26, 35, 6, 6, '2025-11-17 14:30:00', '2025-11-22 10:00:00', 'jhgfdfghjlbmnvcfgtyguhjbncvxczx', 'hgfdsadfghj hgfdsfghj hgfdsfc ', 'good', 'excellent', '2025-11-16 14:34:17', '2025-11-16 14:35:31'),
(27, 37, 6, 6, '2025-11-21 06:00:00', '2025-11-23 07:00:00', ';;hgfhm lkhjg iuyghfcv lkkjhgvc', 'kjh kjh lkjh kjhb kjhb kjbn lkjhgb iuhjgvb ', 'excellent', 'excellent', '2025-11-16 16:45:00', '2025-11-20 10:48:46'),
(28, 38, 6, 6, '2025-11-28 12:02:00', '2025-11-30 05:06:00', 'lkjna zxkljn', 'kjhshjg', 'excellent', 'excellent', '2025-11-16 18:25:41', '2025-11-16 18:27:02'),
(29, 40, 6, 6, '2025-11-21 12:36:00', '0000-00-00 00:00:00', 'ihgdjhb', '', 'excellent', 'excellent', '2025-11-16 18:43:31', '2025-11-16 18:44:18'),
(30, 39, 6, 6, '2025-11-21 14:45:00', '2025-11-25 14:30:00', '', '', 'good', 'fair', '2025-11-16 18:47:55', '2025-11-16 18:48:46'),
(31, 32, 6, 6, '2025-11-23 15:45:00', '2025-11-26 08:45:00', '', '', 'good', 'excellent', '2025-11-16 19:15:18', '2025-11-16 19:16:06'),
(32, 42, 6, 6, '2025-10-17 14:45:00', '2025-10-20 14:45:00', '', '', 'excellent', 'fair', '2025-11-16 20:15:42', '2025-11-16 20:17:17'),
(33, 43, 6, 6, '2025-11-07 21:45:00', '2025-11-18 04:03:00', '', '', 'good', 'fair', '2025-11-17 07:46:12', '2025-11-17 07:48:51'),
(34, 41, 6, 6, '2025-11-17 08:56:00', '2025-11-23 08:00:00', '', '', 'good', 'excellent', '2025-11-17 08:08:55', '2025-11-17 08:10:20'),
(35, 44, 6, 6, '2025-11-20 05:33:00', '2025-11-21 15:07:00', '', '', 'excellent', 'excellent', '2025-11-17 10:15:56', '2025-11-20 06:37:00'),
(36, 28, 6, 6, '2025-11-20 19:22:00', '2025-11-21 05:25:00', 'uytrsdfgnb', '', 'excellent', 'good', '2025-11-20 11:00:07', '2025-11-20 11:01:38'),
(37, 36, 6, 6, '2025-11-21 10:00:00', '2025-11-22 10:00:00', '', '', 'good', 'excellent', '2025-11-21 12:08:58', '2025-11-21 12:11:20'),
(38, 45, 6, 6, '2025-11-23 06:00:00', '2025-11-25 12:25:00', '', 'kkjhgvb jhb bn nb ', 'excellent', 'excellent', '2025-11-22 04:38:45', '2025-11-22 04:50:27'),
(39, 30, 4, 4, '2025-08-07 10:00:00', '2025-11-26 06:30:00', 'kkjhgvb ', '', 'excellent', 'good', '2025-11-22 05:05:46', '2025-11-22 05:08:51'),
(40, 31, 7, 7, '2025-11-23 06:12:00', '2025-11-30 21:11:00', '', '', 'excellent', 'fair', '2025-11-22 05:15:52', '2025-11-22 05:17:43'),
(42, 78, 6, 6, '2026-01-10 14:45:00', '2026-02-26 18:34:00', '', '', 'excellent', 'good', '2026-01-09 06:23:28', '2026-01-09 13:18:47'),
(43, 80, 6, 6, '2026-01-10 10:00:00', '2026-01-10 14:50:00', '', '', 'excellent', 'excellent', '2026-01-09 06:54:02', '2026-01-09 07:17:47'),
(44, 74, 9, 9, '2026-01-01 14:30:00', '2026-01-06 14:30:00', 'l;jhgvdbsbjmb dslkjhmb', '\'ojkh kjhnbv jhnb', 'excellent', 'excellent', '2026-01-09 09:16:03', '2026-01-10 17:56:47'),
(45, 85, 24, 24, '2026-01-11 13:52:00', '2026-03-13 10:00:00', 'iuytf jhg ', ',mnb kjhn kjhnb kljhmnb lkjmnb ', 'excellent', 'fair', '2026-01-09 09:24:36', '2026-03-12 13:52:56'),
(46, 79, 6, NULL, '2026-01-22 14:30:00', NULL, '', NULL, 'excellent', 'good', '2026-01-09 13:17:06', '2026-01-09 13:17:45'),
(47, 84, 24, 4, '2026-01-10 14:30:00', '2026-01-23 14:25:00', '', '', 'excellent', 'excellent', '2026-01-09 14:16:34', '2026-01-09 14:25:20'),
(48, 86, 13, NULL, '2026-01-13 09:15:00', NULL, '', NULL, 'good', 'good', '2026-01-12 10:39:14', '2026-01-12 10:39:46'),
(49, 77, 24, 6, '2026-03-10 14:00:00', '2026-03-12 10:00:00', 'ijhnmc ckjn scljkn cslkjn sdclkjnms lkjnm sc', 'iouhjsk sjkhj skjn sfkjnm sfkjnm sfdmn ', 'excellent', 'good', '2026-03-10 14:04:49', '2026-03-10 14:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

CREATE TABLE `rentals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `notes` varchar(200) NOT NULL,
  `status` enum('pending','confirmed','picked_up','returned','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `agreement_generated` tinyint(1) DEFAULT 0,
  `pickup_completed` tinyint(1) DEFAULT 0,
  `return_completed` tinyint(1) DEFAULT 0,
  `has_damage_report` tinyint(1) DEFAULT 0,
  `has_penalties` tinyint(1) DEFAULT 0,
  `overdue_days` int(11) DEFAULT 0,
  `final_return_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `rentals`
--

INSERT INTO `rentals` (`id`, `user_id`, `equipment_id`, `quantity`, `start_date`, `end_date`, `total_amount`, `notes`, `status`, `created_at`, `updated_at`, `agreement_generated`, `pickup_completed`, `return_completed`, `has_damage_report`, `has_penalties`, `overdue_days`, `final_return_date`) VALUES
(23, 6, 9, 1, '2025-11-16 00:00:00', '2025-11-20 00:00:00', '400.00', '', 'picked_up', '2025-11-15 17:16:10', '2025-11-16 14:17:02', 1, 0, 0, 0, 0, 0, NULL),
(24, 6, 6, 1, '2025-12-17 00:00:00', '2025-12-21 00:00:00', '120.00', '', 'returned', '2025-12-18 17:16:44', '2026-01-12 10:30:07', 0, 0, 0, 1, 1, 0, NULL),
(25, 6, 8, 1, '2025-11-17 00:00:00', '2025-11-22 00:00:00', '140.00', '', 'confirmed', '2025-11-15 17:33:51', '2025-11-16 14:17:10', 0, 0, 0, 1, 0, 0, NULL),
(26, 6, 2, 1, '2025-11-22 00:00:00', '2025-11-23 00:00:00', '85.00', '', 'confirmed', '2025-11-15 17:34:16', '2025-11-16 14:17:14', 0, 0, 0, 0, 0, 0, NULL),
(27, 6, 1, 1, '2025-11-16 00:00:00', '2025-11-18 00:00:00', '50.00', '', 'confirmed', '2025-11-15 17:34:39', '2025-11-22 04:12:35', 0, 0, 0, 1, 0, 0, NULL),
(28, 6, 6, 1, '2025-11-16 00:00:00', '2025-11-18 00:00:00', '60.00', '', 'returned', '2025-11-15 17:35:03', '2025-11-20 12:35:34', 0, 1, 1, 1, 1, 3, '2025-11-21 05:25:00'),
(30, 6, 9, 1, '2025-11-17 00:00:00', '2025-11-18 00:00:00', '100.00', '', 'returned', '2025-11-16 10:25:00', '2025-11-22 05:08:10', 1, 1, 1, 0, 1, 5, '2025-11-26 06:30:00'),
(31, 6, 9, 3, '2025-11-17 00:00:00', '2025-11-20 00:00:00', '900.00', '', 'returned', '2025-11-16 11:52:51', '2025-11-22 05:17:43', 1, 1, 1, 0, 1, 3, '2025-11-30 21:11:00'),
(32, 6, 8, 3, '2025-11-17 00:00:00', '2025-11-21 00:00:00', '336.00', '', 'returned', '2025-11-16 12:01:49', '2025-11-16 19:16:34', 1, 1, 1, 1, 0, 0, '2025-11-26 08:45:00'),
(33, 6, 8, 3, '2025-11-18 00:00:00', '2025-11-19 00:00:00', '56.00', '', 'returned', '2025-11-16 12:04:09', '2025-11-16 14:55:17', 0, 0, 0, 0, 0, 0, NULL),
(34, 6, 3, 4, '2025-11-18 00:00:00', '2025-11-21 00:00:00', '480.00', '', 'returned', '2025-11-16 12:15:29', '2025-11-16 12:20:49', 0, 0, 0, 0, 0, 0, NULL),
(35, 6, 3, 4, '2025-11-17 00:00:00', '2025-11-19 00:00:00', '320.00', '', 'returned', '2025-11-16 12:21:25', '2025-11-16 14:35:31', 0, 1, 1, 0, 0, 0, '2025-11-22 10:00:00'),
(36, 6, 3, 4, '2025-11-17 00:00:00', '2025-11-18 00:00:00', '160.00', '', 'returned', '2025-11-16 12:28:41', '2025-11-21 12:11:20', 1, 1, 1, 1, 1, 4, '2025-11-22 10:00:00'),
(37, 6, 1, 3, '2025-11-18 00:00:00', '2025-11-21 00:00:00', '225.00', '', 'returned', '2025-11-16 16:02:30', '2025-11-20 10:49:44', 1, 1, 1, 1, 1, 0, '2025-11-23 07:00:00'),
(38, 7, 3, 3, '2025-11-18 00:00:00', '2025-11-21 00:00:00', '360.00', '', 'returned', '2025-11-16 16:48:25', '2025-11-20 12:50:18', 1, 1, 1, 1, 1, 0, '2025-11-30 05:06:00'),
(39, 7, 8, 1, '2025-11-17 00:00:00', '2025-11-20 00:00:00', '84.00', '', 'returned', '2025-11-16 18:36:28', '2025-11-16 18:48:46', 1, 1, 1, 0, 0, 0, '2025-11-25 14:30:00'),
(40, 7, 9, 1, '2025-11-29 00:00:00', '2025-12-06 00:00:00', '700.00', '', 'confirmed', '2025-11-16 18:41:37', '2025-11-20 10:44:41', 1, 1, 1, 1, 1, 0, '0000-00-00 00:00:00'),
(41, 14, 1, 1, '2024-12-01 00:00:00', '2024-12-05 00:00:00', '100.00', 'Test rental', 'returned', '2025-11-16 20:05:23', '2025-11-17 08:10:57', 1, 1, 1, 1, 0, 0, '2025-11-23 08:00:00'),
(42, 7, 6, 2, '2025-11-19 00:00:00', '2025-11-22 00:00:00', '180.00', '', 'returned', '2025-11-16 20:05:32', '2025-11-16 20:17:17', 1, 1, 1, 0, 0, 0, '2025-10-20 14:45:00'),
(43, 14, 1, 1, '2024-12-01 00:00:00', '2024-12-05 00:00:00', '100.00', 'Test rental', 'returned', '2025-11-17 07:15:45', '2025-11-22 04:28:09', 1, 1, 1, 1, 1, 0, '2025-11-18 04:03:00'),
(44, 7, 3, 2, '2025-11-19 00:00:00', '2025-11-21 00:00:00', '160.00', '', 'returned', '2025-11-17 10:15:05', '2025-11-22 04:32:49', 1, 1, 1, 1, 1, 0, '2025-11-21 15:07:00'),
(45, 7, 5, 2, '2025-11-23 00:00:00', '2025-11-24 00:00:00', '90.00', '', 'returned', '2025-11-22 04:36:08', '2025-11-22 04:50:27', 1, 1, 1, 1, 1, 0, '2025-11-25 12:25:00'),
(47, 7, 9, 1, '2025-12-16 00:00:00', '2025-12-17 00:00:00', '100.00', '', 'confirmed', '2025-12-15 14:13:22', '2025-12-22 14:19:49', 0, 0, 0, 0, 0, 0, NULL),
(48, 7, 7, 1, '2025-12-24 00:00:00', '2025-12-30 00:00:00', '131.88', '', 'returned', '2025-12-22 14:05:03', '2026-01-12 10:30:02', 0, 0, 0, 0, 0, 0, NULL),
(59, 7, 8, 1, '2025-12-23 00:00:00', '2025-12-24 00:00:00', '28.00', '', 'confirmed', '2025-12-22 14:16:33', '2025-12-22 14:16:46', 0, 0, 0, 0, 0, 0, NULL),
(60, 7, 2, 1, '2025-12-24 00:00:00', '2025-12-28 00:00:00', '340.00', '', 'pending', '2025-12-22 14:32:44', '2025-12-22 14:32:44', 0, 0, 0, 0, 0, 0, NULL),
(61, 7, 2, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '255.00', '', 'pending', '2025-12-22 14:33:10', '2025-12-22 14:33:10', 0, 0, 0, 0, 0, 0, NULL),
(62, 7, 6, 1, '2025-12-23 00:00:00', '2025-12-27 00:00:00', '120.00', '', 'returned', '2025-12-22 14:33:42', '2026-01-12 10:29:56', 0, 0, 0, 0, 0, 0, NULL),
(63, 7, 5, 1, '2025-12-23 00:00:00', '2025-12-27 00:00:00', '180.00', '', 'pending', '2025-12-22 14:35:06', '2025-12-22 14:35:06', 0, 0, 0, 0, 0, 0, NULL),
(64, 7, 1, 1, '2025-12-27 00:00:00', '2025-12-30 00:00:00', '75.00', '', 'pending', '2025-12-22 14:35:51', '2025-12-22 14:35:51', 0, 0, 0, 0, 0, 0, NULL),
(65, 7, 2, 1, '2025-12-23 00:00:00', '2025-12-25 00:00:00', '170.00', '', 'pending', '2025-12-22 14:38:04', '2025-12-22 14:38:04', 0, 0, 0, 0, 0, 0, NULL),
(66, 7, 15, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '270.00', '', 'confirmed', '2025-12-22 15:59:23', '2026-01-09 13:21:53', 0, 0, 0, 0, 0, 0, NULL),
(67, 7, 8, 1, '2025-12-24 00:00:00', '2025-12-26 00:00:00', '56.00', '', 'confirmed', '2025-12-22 16:11:16', '2026-01-09 13:21:51', 0, 0, 0, 0, 0, 0, NULL),
(68, 7, 8, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '84.00', '', 'confirmed', '2025-12-22 16:18:13', '2026-01-09 13:21:48', 0, 0, 0, 0, 0, 0, NULL),
(69, 7, 9, 1, '2025-12-24 00:00:00', '2025-12-26 00:00:00', '200.00', '', 'returned', '2025-12-22 16:21:55', '2026-01-09 08:45:48', 0, 0, 0, 1, 1, 0, NULL),
(70, 7, 6, 1, '2025-12-23 00:00:00', '2025-12-25 00:00:00', '60.00', '', 'returned', '2025-12-22 16:24:35', '2026-01-12 10:29:42', 0, 0, 0, 0, 0, 0, NULL),
(71, 7, 6, 1, '2025-12-26 00:00:00', '2025-12-28 00:00:00', '60.00', '', 'returned', '2025-12-22 16:25:45', '2026-01-12 10:29:38', 0, 0, 0, 0, 0, 0, NULL),
(72, 7, 8, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '84.00', '', 'confirmed', '2025-12-22 16:30:46', '2026-01-09 06:25:30', 0, 0, 0, 0, 0, 0, NULL),
(73, 7, 8, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '84.00', '', 'confirmed', '2025-12-22 16:31:42', '2025-12-22 16:53:56', 0, 0, 0, 0, 0, 0, NULL),
(74, 7, 8, 1, '2025-12-24 00:00:00', '2025-12-26 00:00:00', '56.00', '', 'returned', '2025-12-22 17:06:39', '2026-01-10 17:56:47', 1, 1, 1, 0, 1, 16, '2026-01-06 14:30:00'),
(75, 7, 2, 1, '2025-12-23 00:00:00', '2025-12-26 00:00:00', '255.00', '', 'confirmed', '2025-12-22 17:10:11', '2025-12-22 17:12:59', 1, 0, 0, 0, 0, 0, NULL),
(76, 7, 9, 1, '2025-12-23 00:00:00', '2025-12-27 00:00:00', '400.00', '', 'confirmed', '2025-12-22 17:23:23', '2026-01-07 12:26:29', 0, 0, 0, 1, 1, 0, NULL),
(77, 7, 9, 1, '2026-01-08 00:00:00', '2026-01-10 00:00:00', '200.00', '', 'returned', '2026-01-07 14:09:26', '2026-03-10 14:07:58', 1, 1, 1, 1, 1, 60, '2026-03-12 10:00:00'),
(78, 7, 8, 1, '2026-01-10 00:00:00', '2026-01-16 00:00:00', '168.00', '', 'returned', '2026-01-09 06:20:06', '2026-01-09 14:05:43', 1, 1, 1, 1, 1, 0, '2026-02-26 18:34:00'),
(79, 7, 15, 1, '2026-01-10 00:00:00', '2026-01-14 00:00:00', '360.00', '', 'picked_up', '2026-01-09 06:48:00', '2026-01-09 14:01:13', 1, 1, 0, 1, 1, 0, NULL),
(80, 7, 3, 2, '2026-01-10 00:00:00', '2026-01-13 00:00:00', '240.00', '', 'returned', '2026-01-09 06:51:37', '2026-01-09 07:17:47', 0, 1, 1, 0, 0, 0, '2026-01-10 14:50:00'),
(81, 7, 3, 2, '2026-01-10 00:00:00', '2026-01-12 00:00:00', '160.00', '', 'confirmed', '2026-01-09 08:28:59', '2026-01-09 08:31:02', 0, 0, 0, 0, 0, 0, NULL),
(82, 7, 5, 1, '2026-01-10 00:00:00', '2026-01-13 00:00:00', '135.00', '', 'confirmed', '2026-01-09 08:36:00', '2026-01-09 08:36:18', 0, 0, 0, 0, 0, 0, NULL),
(83, 7, 4, 1, '2026-01-10 00:00:00', '2026-01-11 00:00:00', '35.00', '', 'confirmed', '2026-01-09 08:37:47', '2026-01-12 10:35:23', 1, 0, 0, 0, 0, 0, NULL),
(84, 7, 2, 2, '2026-01-10 00:00:00', '2026-01-13 00:00:00', '510.00', '', 'returned', '2026-01-09 08:39:46', '2026-01-12 08:16:14', 1, 1, 1, 1, 1, 0, '2026-01-23 14:25:00'),
(85, 7, 2, 1, '2026-01-24 00:00:00', '2026-01-28 00:00:00', '340.00', '', 'returned', '2026-01-09 08:40:31', '2026-03-12 13:52:56', 1, 1, 1, 1, 1, 44, '2026-03-13 10:00:00'),
(86, 7, 17, 10, '2026-01-13 00:00:00', '2026-01-16 00:00:00', '2400.00', '', 'picked_up', '2026-01-12 10:37:41', '2026-01-12 10:39:46', 1, 1, 0, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rental_agreements`
--

CREATE TABLE `rental_agreements` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `agreement_text` text DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `signed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `rental_agreements`
--

INSERT INTO `rental_agreements` (`id`, `rental_id`, `agreement_text`, `pdf_path`, `generated_at`, `signed_at`, `created_at`, `updated_at`) VALUES
(16, 28, 'Equipment rental agreement for Excavator from 2024-01-01 to 2024-01-05', 'uploads/agreements/agreement_1_1704067200000.pdf', '2025-11-15 19:21:13', '2024-01-01 08:00:00', '2025-11-15 19:21:13', '2025-11-15 19:34:43'),
(17, 24, 'Equipment rental agreement for Drill Machine from 2024-01-10 to 2024-01-12', 'uploads/agreements/agreement_2_1704844800000.pdf', '2025-11-15 19:21:13', '2024-01-10 12:30:00', '2025-11-15 19:21:13', '2025-11-15 19:33:34'),
(18, 25, 'Equipment rental agreement for Lawn Mower from 2024-02-01 to 2024-02-03', 'uploads/agreements/agreement_3_1706745600000.pdf', '2025-11-15 19:21:13', '2024-02-01 07:15:00', '2025-11-15 19:21:13', '2025-11-15 19:33:40'),
(19, 26, 'Equipment rental agreement for Excavator from 2024-02-15 to 2024-02-20', 'uploads/agreements/agreement_4_1707955200000.pdf', '2025-11-15 19:21:13', '2024-02-15 14:45:00', '2025-11-15 19:21:13', '2025-11-15 19:33:47'),
(20, 27, 'Equipment rental agreement for Concrete Mixer from 2024-03-01 to 2024-03-02', 'uploads/agreements/agreement_5_1709251200000.pdf', '2025-11-15 19:21:13', '2024-03-01 09:20:00', '2025-11-15 19:21:13', '2025-11-15 19:33:56'),
(21, 23, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 15/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Bil-jax indoor/outdoor scaffolding tower – 30′ kit\nRental Period: 16/11/2025 to 20/11/2025 (4 days)\nDaily Rate: $100\nTotal Amount: $400.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 15/11/2025, 9:27:16 pm', 'uploads/agreements/agreement_23_1763234836235.pdf', '2025-11-15 19:27:16', '2025-11-16 10:10:14', '2025-11-15 19:27:16', '2025-11-16 10:10:14'),
(22, 36, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Lawn Mower\nRental Period: 17/11/2025 to 18/11/2025 (1 days)\nDaily Rate: $160\nTotal Amount: $160.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 2:44:23 pm', 'uploads/agreements/agreement_36_1763297063199.pdf', '2025-11-16 12:44:23', '2025-11-16 12:46:18', '2025-11-16 12:44:23', '2025-11-16 12:46:18'),
(23, 32, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Circular Saw\nRental Period: 17/11/2025 to 21/11/2025 (4 days)\nDaily Rate: $84\nTotal Amount: $336.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 6:25:27 pm', 'uploads/agreements/agreement_32_1763310327966.pdf', '2025-11-16 16:25:28', '2025-11-16 16:26:02', '2025-11-16 16:25:28', '2025-11-16 16:26:02'),
(24, 37, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Cordless Drill\nRental Period: 18/11/2025 to 21/11/2025 (3 days)\nDaily Rate: $75\nTotal Amount: $225.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 6:44:49 pm', 'uploads/agreements/agreement_37_1763311489061.pdf', '2025-11-16 16:44:49', NULL, '2025-11-16 16:44:49', '2025-11-16 16:44:49'),
(25, 31, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Bil-jax indoor/outdoor scaffolding tower – 30′ kit\nRental Period: 17/11/2025 to 20/11/2025 (3 days)\nDaily Rate: $300\nTotal Amount: $900.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 8:24:25 pm', 'uploads/agreements/agreement_31_1763317465041.pdf', '2025-11-16 18:24:25', NULL, '2025-11-16 18:24:25', '2025-11-16 18:24:25'),
(26, 38, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Lawn Mower\nRental Period: 18/11/2025 to 21/11/2025 (3 days)\nDaily Rate: $120\nTotal Amount: $360.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 8:25:31 pm', 'uploads/agreements/agreement_38_1763317531158.pdf', '2025-11-16 18:25:31', NULL, '2025-11-16 18:25:31', '2025-11-16 18:25:31'),
(27, 40, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Bil-jax indoor/outdoor scaffolding tower – 30′ kit\nRental Period: 29/11/2025 to 06/12/2025 (7 days)\nDaily Rate: $100\nTotal Amount: $700.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 8:43:25 pm', 'uploads/agreements/agreement_40_1763318605896.pdf', '2025-11-16 18:43:25', NULL, '2025-11-16 18:43:25', '2025-11-16 18:43:25'),
(28, 39, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Circular Saw\nRental Period: 17/11/2025 to 20/11/2025 (3 days)\nDaily Rate: $28\nTotal Amount: $84.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 8:47:53 pm', 'uploads/agreements/agreement_39_1763318873148.pdf', '2025-11-16 18:47:53', '2025-11-16 18:50:01', '2025-11-16 18:47:53', '2025-11-16 18:50:01'),
(29, 42, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 16/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Hammer Drill\nRental Period: 19/11/2025 to 22/11/2025 (3 days)\nDaily Rate: $60\nTotal Amount: $180.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 16/11/2025, 10:15:39 pm', 'uploads/agreements/agreement_42_1763324139386.pdf', '2025-11-16 20:15:39', NULL, '2025-11-16 20:15:39', '2025-11-16 20:15:39'),
(30, 43, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 17/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: john.doe@email.com\n\nEQUIPMENT DETAILS:\nEquipment: Cordless Drill\nRental Period: 01/12/2024 to 05/12/2024 (4 days)\nDaily Rate: $25\nTotal Amount: $100.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 17/11/2025, 9:46:09 am', 'uploads/agreements/agreement_43_1763365569041.pdf', '2025-11-17 07:46:09', '2025-11-17 08:08:36', '2025-11-17 07:46:09', '2025-11-17 08:08:36'),
(31, 41, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 17/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: john.doe@email.com\n\nEQUIPMENT DETAILS:\nEquipment: Cordless Drill\nRental Period: 01/12/2024 to 05/12/2024 (4 days)\nDaily Rate: $25\nTotal Amount: $100.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 17/11/2025, 10:08:47 am', 'uploads/agreements/agreement_41_1763366927626.pdf', '2025-11-17 08:08:47', '2025-11-17 08:08:51', '2025-11-17 08:08:47', '2025-11-17 08:08:51'),
(32, 44, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 17/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Lawn Mower\nRental Period: 19/11/2025 to 21/11/2025 (2 days)\nDaily Rate: $80\nTotal Amount: $160.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 17/11/2025, 12:15:53 pm', 'uploads/agreements/agreement_44_1763374553477.pdf', '2025-11-17 10:15:53', NULL, '2025-11-17 10:15:53', '2025-11-17 10:15:53'),
(33, 45, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 22/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Table Saw\nRental Period: 23/11/2025 to 24/11/2025 (1 days)\nDaily Rate: $90\nTotal Amount: $90.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 22/11/2025, 6:36:26 am', 'uploads/agreements/agreement_45_1763786186996.pdf', '2025-11-22 04:36:27', NULL, '2025-11-22 04:36:27', '2025-11-22 04:36:27'),
(34, 30, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 22/11/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nNeiodo Maleeelaa (\"Customer\")\nEmail: neiodomaleeelaa@gmail.com\n\nEQUIPMENT DETAILS:\nEquipment: Bil-jax indoor/outdoor scaffolding tower – 30′ kit\nRental Period: 17/11/2025 to 18/11/2025 (1 days)\nDaily Rate: $100\nTotal Amount: $100.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, Neiodo Maleeelaa, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 22/11/2025, 7:05:49 am', 'uploads/agreements/agreement_30_1763787949691.pdf', '2025-11-22 05:05:49', NULL, '2025-11-22 05:05:49', '2025-11-22 05:05:49'),
(36, 75, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 22/12/2025, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Concrete Mixer\nRental Period: 23/12/2025 to 26/12/2025 (3 days)\nDaily Rate: $85\nTotal Amount: $255.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 22/12/2025, 7:12:59 pm', 'uploads/agreements/agreement_75_1766423579626.pdf', '2025-12-22 17:12:59', '2025-12-22 17:13:03', '2025-12-22 17:12:59', '2025-12-22 17:13:03'),
(37, 74, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 09/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Circular Saw\nRental Period: 24/12/2025 to 26/12/2025 (2 days)\nDaily Rate: $28\nTotal Amount: $56.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 09/01/2026, 11:15:57 am', 'uploads/agreements/agreement_74_1767950157582.pdf', '2026-01-09 09:15:57', NULL, '2026-01-09 09:15:57', '2026-01-09 09:15:57'),
(38, 85, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 09/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Concrete Mixer\nRental Period: 24/01/2026 to 28/01/2026 (4 days)\nDaily Rate: $85\nTotal Amount: $340.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 09/01/2026, 11:24:24 am', 'uploads/agreements/agreement_85_1767950664185.pdf', '2026-01-09 09:24:24', NULL, '2026-01-09 09:24:24', '2026-01-09 09:24:24'),
(39, 79, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 09/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: ljkhgfxcvbnm;kjhbv\nRental Period: 10/01/2026 to 14/01/2026 (4 days)\nDaily Rate: $90\nTotal Amount: $360.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 09/01/2026, 3:16:14 pm', 'uploads/agreements/agreement_79_1767964574475.pdf', '2026-01-09 13:16:14', NULL, '2026-01-09 13:16:14', '2026-01-09 13:16:14'),
(40, 78, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 09/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Circular Saw\nRental Period: 10/01/2026 to 16/01/2026 (6 days)\nDaily Rate: $28\nTotal Amount: $168.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 09/01/2026, 3:18:15 pm', 'uploads/agreements/agreement_78_1767964695183.pdf', '2026-01-09 13:18:15', NULL, '2026-01-09 13:18:15', '2026-01-09 13:18:15'),
(41, 84, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 12/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Concrete Mixer\nRental Period: 10/01/2026 to 13/01/2026 (3 days)\nDaily Rate: $170\nTotal Amount: $510.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 12/01/2026, 10:16:13 am', 'uploads/agreements/agreement_84_1768205773909.pdf', '2026-01-12 08:16:13', NULL, '2026-01-12 08:16:13', '2026-01-12 08:16:13'),
(42, 83, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 12/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Pressure Washer\nRental Period: 10/01/2026 to 11/01/2026 (1 days)\nDaily Rate: $35\nTotal Amount: $35.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 12/01/2026, 12:35:23 pm', 'uploads/agreements/agreement_83_1768214123755.pdf', '2026-01-12 10:35:23', NULL, '2026-01-12 10:35:23', '2026-01-12 10:35:23'),
(43, 86, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 12/01/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Flex Cordless Drill\nRental Period: 13/01/2026 to 16/01/2026 (3 days)\nDaily Rate: $800\nTotal Amount: $2400.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 12/01/2026, 12:39:12 pm', 'uploads/agreements/agreement_86_1768214352055.pdf', '2026-01-12 10:39:12', NULL, '2026-01-12 10:39:12', '2026-01-12 10:39:12'),
(44, 77, 'EQUIPMENT RENTAL AGREEMENT\n\nThis Equipment Rental Agreement (the \"Agreement\") is made and entered into as of 10/03/2026, by and between:\n\nEquipment Rental Company (\"Company\")\nand\nJohn Doe (\"Customer\")\nEmail: johndoe@example.com\n\nEQUIPMENT DETAILS:\nEquipment: Bil-jax indoor/outdoor scaffolding tower – 30′ kit\nRental Period: 08/01/2026 to 10/01/2026 (2 days)\nDaily Rate: $100\nTotal Amount: $200.00\n\nTERMS AND CONDITIONS:\n\n1. RENTAL PERIOD: The equipment shall be rented for the period specified above.\n\n2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.\n\n3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.\n\n4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.\n\n5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.\n\n6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.\n\n7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.\n\n8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.\n\nCUSTOMER ACKNOWLEDGMENT:\n\nI, John Doe, acknowledge that I have read and understood this agreement and agree to its terms.\n\nCustomer Signature: ___________________________ Date: __________\n\nCompany Representative: _______________________ Date: __________\n\nGenerated on: 10/03/2026, 4:04:08 pm', 'uploads/agreements/agreement_77_1773151448287.pdf', '2026-03-10 14:04:08', NULL, '2026-03-10 14:04:08', '2026-03-10 14:04:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','staff','customer') DEFAULT 'customer',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `phone`, `address`, `role`, `is_active`, `created_at`, `updated_at`, `two_factor_secret`, `two_factor_enabled`, `email_verified`, `email_verification_token`) VALUES
(4, 'simphiwedlamini@gmail.com', '$2b$12$n4ntzpg4Y5dyat.X/2kFZ.CHBkB1rbr3kb0pEZ6uDIxjAciDBmgpu', 'Simphiwe', 'Dlamini', '+26879782227', 'Bhunya, Lamgabhi, Next to Dube store', 'staff', 1, '2025-11-02 11:39:21', '2026-01-09 09:56:05', NULL, 0, 1, NULL),
(5, 'nedomalela@gmail.com', '$2b$12$0Ypg9n1eEwMh6FmgTUpy4eVUBgu/iWjjzI5xV0Z7yCVRdwOpiSNK.', 'Nedo', 'Malela', '+268762542451', 'kkjhjsd, gfhjkkls ', 'customer', 1, '2025-11-02 11:58:15', '2025-11-02 11:58:15', NULL, 0, 0, NULL),
(6, 'neiodomaleeelaa@gmail.com', '$2b$12$vL4W4VMgYspPvRcNI/f82u6Vsse4JJKgF3xIYvu66/QkkbRl77CNa', 'Neiodo', 'Maleeelaa', '+268762548292', 'kkjhjsd, gfhjkkls iosuaisoa  jkjdskasa', 'admin', 1, '2025-11-02 12:09:42', '2026-01-31 10:49:33', '123456', 0, 1, NULL),
(7, 'johndoe@example.com', '$2b$12$a8sMy7LGRc185YQudE28e.dBkBuh7aBLIBsVdG4kQ7CICYDe9.fwa', 'John', 'Doe', '+268 73873283', 'Mahamba mbamba', 'customer', 1, '2025-11-05 10:41:06', '2026-01-07 12:10:52', NULL, 0, 1, '48b20e62d070f46215c6e533df341f291d85b6ba3fb59805835123ab7d69d1b0'),
(8, 'admin@example.com', '$2b$10$H6lk1sTce5uJhiMgoHb0SO7j7Kdq8gu3taAgFTuzts2d1yrtXzHrq', 'John', 'Admin', '1234567890', NULL, 'admin', 1, '2025-11-15 14:44:12', '2026-01-09 09:34:38', NULL, 0, 1, NULL),
(9, 'staff@example.com', '$2b$10$hash', 'Jane', 'Staff', '1234567891', NULL, 'staff', 1, '2025-11-15 14:44:12', '2026-01-09 09:56:15', NULL, 0, 1, NULL),
(10, 'customer@example.com', '$2b$10$hash', 'Bob', 'Customer', '1234567892', NULL, 'customer', 1, '2025-11-15 14:44:12', '2025-11-15 14:44:12', NULL, 0, 0, NULL),
(13, 'admin@equipment.com', '$2b$12$vwXc/ENZDkTtq1UkNG0mVOdw6i1ZoCeJIWaVK31uWZE6jrFJ7zYAK', 'Admin', 'User', '1234567890', '123 Admin St', 'admin', 1, '2025-11-16 20:02:17', '2026-01-09 10:00:04', NULL, 0, 1, ''),
(14, 'john.doe@email.com', '$2b$12$s6ghAuMNV3gLrAtSJVSffORIxKZbo0Sj6npK3K9SxVgbRlpQT6NTO', 'John', 'Doe', '0987654321', '456 Customer St', 'customer', 1, '2025-11-16 20:03:00', '2025-11-25 14:23:50', NULL, 0, 1, NULL),
(15, 'thembasimelane@gmail.com', '$2b$12$yPBRMmYxrIDKPLqRLgfj3ONa1/MQx3hnkofnVh9YC9fM6aPEl5C7K', 'Themba', 'Simelame', '78653908', 'Mbabane, emvakelitje', 'customer', 1, '2025-11-26 14:06:43', '2025-11-26 14:06:43', NULL, 0, 0, 'a2491e8bfa8c3f3b90f66627b6aefb97338edb0114b195e93fce6a0b2b7031aa'),
(17, 'dlaminisimphiwe0307@gmail.com', '$2b$12$LNz47llweEXSXNT9XuvJpO.GGyHMNAdSD6sOT0fMpsyZy0ADC5Dze', 'ksjsnsm', 's;lkjnm,s.', '8978765454', 'lkasjksad sajn ashjkas jkasdn asldk', 'customer', 1, '2025-11-28 10:21:35', '2025-11-28 10:21:35', NULL, 0, 0, '477231c0bff8c5c59bbead11bca930926dbb55a9a83d34a2b6ab5ca92d6a3bcf'),
(19, 'katherine.schneider@ethereal.email', '$2b$12$3LkozAtBkBaZWcumY6O6V.cKNjY2O804n9ghbXdzNBzUjCe5TfDF2', 'kioj', 'miolio', '12344555', 'ksjnmmajdknm dsajnm ', 'customer', 1, '2025-11-28 11:01:13', '2025-11-28 11:01:13', NULL, 0, 0, 'bd5a534b1c0b801cc8176c1b452b05220aaec55327d375a5efab2f5d0445231d'),
(20, 'johancryuf@gmail.com', '$2b$12$mY/AXi/494SN3T1IjtnVO.X7KS61OXsw2ZimSthT.1K2TCiiDGYmq', 'Johan', 'Cryuf', '78256216271', 'oiujhgsa skjahb kjashb', 'customer', 1, '2025-11-28 11:04:48', '2025-11-28 12:31:15', NULL, 0, 1, 'bd5a534b1c0b801cc8176c1b452b05220aaec55327d375a5efab2f5d0445231d'),
(21, 'sne.dube@gmail.com', '$2b$12$ethF6WGknzT8J5KeP2xLguV42CZqiGzvFI2Ke5kb8.8Sge7R6bkV.', 'Snezwi', 'Dube', '7826271672', 'ojhbnsa asjhb sajknsa sakj', 'customer', 1, '2025-11-28 12:33:32', '2025-11-28 12:37:11', NULL, 0, 1, NULL),
(22, 'skjhsa.sjhas@gmail.com', '$2b$12$V/ug90ve1mci8R8mR1OFt.1oX3KRQ5uE8zsB0Qcdq4kA3w4QOMpQ6', 'jskhs', 'jasbsh', '278627821', 'iosuid dsj asjk asdjk asdljk sadkj', 'customer', 1, '2025-11-28 13:26:12', '2025-11-28 13:26:41', NULL, 0, 1, NULL),
(23, 'uijshsja.klsjsjhd@gmail.com', '$2b$12$a/3x4jPY3LVYNg1vC3WgjeZx.WN3sR/q/k//IECRWqomIYF5pNj/e', 'osid', 'opkdjd', '1234567832', 'jhsajks jhs sjkdb kjsdb', 'customer', 1, '2025-11-28 13:28:54', '2025-11-28 13:30:25', NULL, 0, 1, NULL),
(24, 'posksjakjska.jska@ksjakjs.com', '$2b$12$vL4W4VMgYspPvRcNI/f82u6Vsse4JJKgF3xIYvu66/QkkbRl77CNa', 'piusyua', 'joisusay', '7826256126', 'uiiygfsbn shgbn kjshb skjhbs ', 'admin', 1, '2025-11-28 13:36:41', '2025-12-15 14:09:05', NULL, 0, 1, NULL),
(26, 'gillphilips@gmail.com', '$2b$12$vL4W4VMgYspPvRcNI/f82u6Vsse4JJKgF3xIYvu66/QkkbRl77CNa', 'Gill', 'Philips', '79765434', 'yhgfd uiyb ujhg uj', 'customer', 1, '2026-01-14 06:52:29', '2026-01-14 07:04:04', NULL, 0, 1, NULL),
(28, 'john.john@gmail.com', '$2b$12$Z/DvP3Ii49CJM43s6OeQH.wL6bLgAKyg36wV4S8L0sPbu/yHk1c9G', 'John', 'John', '78654099', 'iuygh sjhgb dsjhb sdjhbds sjdbn sdjkbn ', 'customer', 1, '2026-03-12 12:23:24', '2026-03-12 12:27:03', NULL, 0, 1, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_id` (`rental_id`),
  ADD KEY `idx_reported_by` (`reported_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_severity` (`severity_level`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_under_maintenance` (`under_maintenance`);

--
-- Indexes for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipment_id` (`equipment_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rental_id` (`rental_id`);

--
-- Indexes for table `penalties`
--
ALTER TABLE `penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_id` (`rental_id`),
  ADD KEY `idx_penalty_type` (`penalty_type`),
  ADD KEY `idx_applied_at` (`applied_at`),
  ADD KEY `idx_paid_at` (`paid_at`);

--
-- Indexes for table `pickup_returns`
--
ALTER TABLE `pickup_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_id` (`rental_id`),
  ADD KEY `idx_pickup_staff` (`pickup_staff_id`),
  ADD KEY `idx_return_staff` (`return_staff_id`),
  ADD KEY `idx_pickup_datetime` (`pickup_datetime`),
  ADD KEY `idx_return_datetime` (`return_datetime`);

--
-- Indexes for table `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `idx_agreement_generated` (`agreement_generated`),
  ADD KEY `idx_pickup_completed` (`pickup_completed`),
  ADD KEY `idx_return_completed` (`return_completed`),
  ADD KEY `idx_has_damage_report` (`has_damage_report`),
  ADD KEY `idx_has_penalties` (`has_penalties`),
  ADD KEY `idx_overdue_days` (`overdue_days`);

--
-- Indexes for table `rental_agreements`
--
ALTER TABLE `rental_agreements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_id` (`rental_id`),
  ADD KEY `idx_generated_at` (`generated_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_two_factor_enabled` (`two_factor_enabled`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `damage_reports`
--
ALTER TABLE `damage_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `maintenance`
--
ALTER TABLE `maintenance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `penalties`
--
ALTER TABLE `penalties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `pickup_returns`
--
ALTER TABLE `pickup_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `rental_agreements`
--
ALTER TABLE `rental_agreements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD CONSTRAINT `damage_reports_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `damage_reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `equipment`
--
ALTER TABLE `equipment`
  ADD CONSTRAINT `equipment_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `maintenance_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`);

--
-- Constraints for table `penalties`
--
ALTER TABLE `penalties`
  ADD CONSTRAINT `penalties_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pickup_returns`
--
ALTER TABLE `pickup_returns`
  ADD CONSTRAINT `pickup_returns_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pickup_returns_ibfk_2` FOREIGN KEY (`pickup_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pickup_returns_ibfk_3` FOREIGN KEY (`return_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rentals`
--
ALTER TABLE `rentals`
  ADD CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`);

--
-- Constraints for table `rental_agreements`
--
ALTER TABLE `rental_agreements`
  ADD CONSTRAINT `rental_agreements_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
