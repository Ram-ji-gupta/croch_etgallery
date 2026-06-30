-- croch_etgallery Database Backup


CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_password VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  stock INT NOT NULL,
  image VARCHAR(255),
  description TEXT
);


CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  email VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  custom_requirement TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL
);

INSERT INTO settings (id, store_name, phone, email, address, admin_username, admin_password) VALUES (1, 'croch_etgallery-1', '8957265847', '', 'Jaipur.Rajasthan', 'admin', 'admin@123');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (19, '🎀 Crocheted Pink Lace Bow', '180.00', 'Apparels', 15, '1782047348104-Crocheted Pink Lace Bow.webp', 'Handmade wool bow in soft pink with a delicate white border, featuring intricate crochet lacework for a charming and elegant touch.');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (22, 'Bloom Crochet Sunflower', '250.00', 'Gift Sets', 20, '1782048230689-WhatsApp Image 2026-06-03 at 7.30.02 PM (1).webp', 'Handmade crochet sunflower with bright yellow petals, a rich brown center, and green leaves, beautifully wrapped in decorative paper and tied with a festive ribbon.');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (23, 'Dreamy Wings Crochet Butterfly', '180.00', 'Gift Sets', 15, '1782048329432-WhatsApp Image 2026-06-03 at 7.30.03 PM.webp', 'Handmade crochet butterfly ornament in soft pink, white, and blue yarn, with delicate braided strands ending in tiny flower motifs for a whimsical touch.');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (26, 'Elegant Red & White Khana Dress Set', '650.00', 'Kanha Dresses', 20, '1782048918076-WhatsApp Image 2026-06-16 at 11.06.13 AM.webp', 'Handmade crochet khana dress with scalloped edges in alternating red and white yarn, adorned with delicate beadwork. Paired with a matching heart-shaped crochet piece, this set showcases fine craftsmanship and festive charm.');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (27, 'Scarlet Bloom Beaded Bag - Test Updated Twice', '799.00', 'Bags', 15, '1782049110276-WhatsApp Image 2026-06-03 at 7.30.02 PM.webp', 'Unique handmade round handbag designed like a vibrant red flower, paired with a striking strap of large white beads for a bold and elegant statement piece.');
INSERT INTO products (id, name, price, category, stock, image, description) VALUES (28, 'deom12', '123', 'Bags', 12, '1782797313136-WhatsApp_Image_2026-06-16_at_11.06.31_AM.webp', 'demo12');
INSERT INTO customers (id, name, phone, address, email) VALUES (1, 'Ram', '9876543210', 'Delhi', NULL);
INSERT INTO customers (id, name, phone, address, email) VALUES (2, 'test order', '7973856211', 'test address', NULL);
INSERT INTO customers (id, name, phone, address, email) VALUES (3, 'test4', '7489542658', 'kjsdtest4', 'dsr@gmail.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (4, 'demo6', '745895742157', 'demo6', 'demo6@gmaul.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (5, 'demi10', 'demo10', 'demo@10', 'demo10@gmail.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (6, 'demo11', '7489542169', 'demo11', 'demo11@gmial.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (7, 'demo13', '79725485644', 'demo123', 'demo123@gmail.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (8, 'demo16', 'demo16', 'demo16', 'demo16@gmail.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (9, 'demo17', 'demo17', 'demo17', 'demo17@gmial.com');
INSERT INTO customers (id, name, phone, address, email) VALUES (10, 'demo18', 'demo18', 'demo18demo18', 'demo18');
INSERT INTO customers (id, name, phone, address, email) VALUES (11, 'demo20', 'demo20', 'demo20', 'demo20');
INSERT INTO customers (id, name, phone, address, email) VALUES (12, 'demo21', 'demo21', 'demo21', 'demo21');
INSERT INTO customers (id, name, phone, address, email) VALUES (13, 'demo25', 'demo22', 'demo22', 'demo22');
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (1, 'Ram Gupta', '9876543210', NULL, 'Delhi', NULL, 'Shipped', '2026-06-16 06:28:27', 0.00);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (2, 'test order', '7973856211', NULL, 'test address', NULL, 'Shipped', '2026-06-21 13:53:35', 360.00);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (3, 'test2', '7973856211', NULL, 'test2', NULL, 'Shipped', '2026-06-21 17:39:01', 799.00);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (4, 'test3', '7973856211', NULL, 'test3', NULL, 'Shipped', '2026-06-21 17:45:39', 650.00);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (5, 'test4', '7489542658', 'dsr@gmail.com', 'kjsdtest4', 'test567', 'Delivered', '2026-06-22 17:25:18', 350.00);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (6, 'demo6', '745895742157', 'demo6@gmaul.com', 'demo6', 'demo6', '1950.00', '2026-06-28 10:23:43', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (7, 'demo7', '78945824957', 'demo7@gmail.com', 'demo7@', 'demo@', '180.00', '2026-06-28 10:30:57', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (8, 'demo9', '78945824957', 'demo9@gmail.com', 'demo9', 'demo9', 'Delivered', '2026-06-28 10:45:14', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (9, 'demi10', 'demo10', 'demo10@gmail.com', 'demo@10', 'demo@10', 'Pending', '2026-06-28 11:50:10', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (10, 'demo11', '7489542169', 'demo11@gmial.com', 'demo11', 'demo11', '430.00', '2026-06-28 12:15:58', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (11, 'demo13', '79725485644', 'demo123@gmail.com', 'demo123', 'demo123', '180.00', '2026-06-28 12:56:57', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (12, 'demo15', '745896425', 'demo15@gmail.com', 'demo15', 'demo15', '799.00', '2026-06-28 13:02:21', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (13, 'demo16', 'demo16', 'demo16@gmail.com', 'demo16', NULL, '180.00', '2026-06-28 16:06:48', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (14, 'demo17', 'demo17', 'demo17@gmial.com', 'demo17', 'demo17', '650.00', '2026-06-28 16:11:35', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (15, 'demo18', 'demo18', 'demo18', 'demo18demo18', 'demo18', '650.00', '2026-06-28 16:18:11', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (16, 'demo18', 'demo18', 'demo18', 'demo18', 'demo18', '799.00', '2026-06-28 16:28:21', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (17, 'demo20', 'demo20', 'demo20', 'demo20', 'demo20', '1449.00', '2026-06-28 16:32:06', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (18, 'demo20', 'demo20', 'demo20', 'demo20', 'demo20', '799.00', '2026-06-28 16:35:01', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (19, 'demo21', 'demo21', 'demo21', 'demo21', 'demo21', '799.00', '2026-06-28 16:40:22', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (20, 'demo25', 'demo22', 'demo22', 'demo22', 'demo22', '1449.00', '2026-06-28 16:41:11', 0);
INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (21, 'John Doe', '1234567890', 'john@example.com', '123 Street, City', 'Gift wrap', '799.00', '2026-06-30 05:00:53', 0);
