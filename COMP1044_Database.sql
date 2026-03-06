-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 06, 2026 at 10:27 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `comp1044_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `assessment_id` int(11) NOT NULL,
  `internship_id` int(11) DEFAULT NULL,
  `undertaking_tasks` int(11) DEFAULT NULL,
  `health_safety` int(11) DEFAULT NULL,
  `theoretical_knowledge` int(11) DEFAULT NULL,
  `report_presentation` int(11) DEFAULT NULL,
  `clarity_language` int(11) DEFAULT NULL,
  `lifelong_learning` int(11) DEFAULT NULL,
  `project_management` int(11) DEFAULT NULL,
  `time_management` int(11) DEFAULT NULL,
  `comments` text,
  `final_score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`assessment_id`, `internship_id`, `undertaking_tasks`, `health_safety`, `theoretical_knowledge`, `report_presentation`, `clarity_language`, `lifelong_learning`, `project_management`, `time_management`, `comments`, `final_score`) VALUES
(1, 1, 80, 85, 78, 82, 80, 88, 84, 83, 'Good performance overall', 82),
(2, 2, 75, 70, 72, 74, 73, 76, 71, 72, 'Needs improvement in report writing', 73),
(3, 3, 90, 88, 91, 87, 89, 92, 90, 88, 'Excellent work and strong understanding', 89),
(4, 4, 65, 68, 70, 66, 67, 69, 64, 68, 'Average performance', 67);

-- --------------------------------------------------------

--
-- Table structure for table `assessors`
--

CREATE TABLE `assessors` (
  `assessor_id` int(11) NOT NULL,
  `assessor_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `assessors`
--

INSERT INTO `assessors` (`assessor_id`, `assessor_name`, `email`, `user_id`) VALUES
(1, 'Dr. Ahmad', 'ahmad@university.edu', 2),
(2, 'Dr. Lee', 'lee@university.edu', 3);

-- --------------------------------------------------------

--
-- Table structure for table `internships`
--

CREATE TABLE `internships` (
  `internship_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `assessor_id` int(11) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `internships`
--

INSERT INTO `internships` (`internship_id`, `student_id`, `assessor_id`, `company_name`) VALUES
(1, 1, 1, 'Tech Solutions Sdn Bhd'),
(2, 2, 1, 'Innovatech Malaysia'),
(3, 3, 2, 'CyberSoft Technologies'),
(4, 4, 2, 'DataWorks Analytics');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_name` varchar(100) DEFAULT NULL,
  `programme` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_name`, `programme`) VALUES
(1, 'Aarush Sharma', 'Computer Science'),
(2, 'John Tan', 'Information Technology'),
(3, 'Nur Aisyah', 'Software Engineering'),
(4, 'Michael Lim', 'Data Science');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`) VALUES
(1, 'admin1', 'admin123', 'admin'),
(2, 'lecturer1', 'pass123', 'assessor'),
(3, 'lecturer2', 'pass123', 'assessor');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`assessment_id`),
  ADD KEY `internship_id` (`internship_id`);

--
-- Indexes for table `assessors`
--
ALTER TABLE `assessors`
  ADD PRIMARY KEY (`assessor_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `internships`
--
ALTER TABLE `internships`
  ADD PRIMARY KEY (`internship_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `assessor_id` (`assessor_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `assessment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `assessors`
--
ALTER TABLE `assessors`
  MODIFY `assessor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `internships`
--
ALTER TABLE `internships`
  MODIFY `internship_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`internship_id`) REFERENCES `internships` (`internship_id`);

--
-- Constraints for table `assessors`
--
ALTER TABLE `assessors`
  ADD CONSTRAINT `assessors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `internships`
--
ALTER TABLE `internships`
  ADD CONSTRAINT `internships_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `internships_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `assessors` (`assessor_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
