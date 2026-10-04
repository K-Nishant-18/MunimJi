-- ---------------------------------------------------------------------------
-- MunimJi sample data
-- Written in SQL that runs on both H2 (default dev DB) and MySQL:
--   * INSERT ... SELECT ... WHERE NOT EXISTS  (idempotent, safe to run again)
--   * CURRENT_DATE + INTERVAL '45' DAY       (relative expiry dates)
-- Explicit ids are used so the foreign keys are easy to read; MySQL and H2
-- move their identity counter to max(id) + 1 automatically.
-- ---------------------------------------------------------------------------

-- Users: 1 owner + 1 staff (passwords are BCrypt hashes of owner123 / staff123)
INSERT INTO users (id, name, email, password, role)
SELECT 1, 'Ramesh Sharma', 'owner@munimji.local', '$2a$10$NLL.AsGcbVoMnBQDhYjgCOTJrR7NO37TxFNcwG/9QW0PRwAI3UeR2', 'OWNER'
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'owner@munimji.local');

INSERT INTO users (id, name, email, password, role)
SELECT 2, 'Amit Verma', 'staff@munimji.local', '$2a$10$JJ0J4GWi6RI4NkuQLl7f8.S7onwfGepDfjwhZyQWL2fN.4pLgB9CO', 'STAFF'
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'staff@munimji.local');

-- Categories
INSERT INTO category (id, name)
SELECT 1, 'Kirana' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Kirana');
INSERT INTO category (id, name)
SELECT 2, 'Beverages' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Beverages');
INSERT INTO category (id, name)
SELECT 3, 'Snacks' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Snacks');
INSERT INTO category (id, name)
SELECT 4, 'Personal Care' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Personal Care');
INSERT INTO category (id, name)
SELECT 5, 'Medicines' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Medicines');
INSERT INTO category (id, name)
SELECT 6, 'Household' WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = 'Household');

-- Suppliers (3)
INSERT INTO supplier (id, name, phone, email, address, gstin)
SELECT 1, 'Sharma Distributors', '9812345678', 'sharma.dist@example.com', '14 Market Road, Indore', '23AACCS1234A1Z1'
WHERE NOT EXISTS (SELECT 1 FROM supplier s WHERE s.name = 'Sharma Distributors');
INSERT INTO supplier (id, name, phone, email, address, gstin)
SELECT 2, 'Gupta Wholesale Traders', '9822345678', 'gupta.wholesale@example.com', '22 Station Road, Bhopal', '23AADCG5678A1Z2'
WHERE NOT EXISTS (SELECT 1 FROM supplier s WHERE s.name = 'Gupta Wholesale Traders');
INSERT INTO supplier (id, name, phone, email, address, gstin)
SELECT 3, 'MediCare Pharma Supplies', '9832345678', 'medicare.supplies@example.com', '5 Pharma Mandi, Indore', '23AABCM9012A1Z3'
WHERE NOT EXISTS (SELECT 1 FROM supplier s WHERE s.name = 'MediCare Pharma Supplies');

-- Products (20, mix of kirana and pharmacy)
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 1, 'Basmati Rice 5kg', '8901234000011', 'pouch', '1006', 5.00, 450.00, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000011');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 2, 'Toor Dal 1kg', '8901234000028', 'pack', '0713', 5.00, 160.00, 15, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000028');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 3, 'Refined Sunflower Oil 1L', '8901234000035', 'bottle', '1512', 5.00, 145.00, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000035');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 4, 'Whole Wheat Atta 10kg', '8901234000042', 'bag', '1101', 0.00, 420.00, 8, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000042');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 5, 'Sugar 1kg', '8901234000059', 'pack', '1701', 5.00, 45.00, 20, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000059');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 6, 'Iodized Salt 500g', '8901234000066', 'pack', '2501', 0.00, 22.00, 25, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000066');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 7, 'Tea Leaves 250g', '8901234000073', 'pack', '0902', 5.00, 130.00, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000073');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 8, 'Turmeric Powder 200g', '8901234000080', 'pack', '0910', 5.00, 60.00, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000080');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 9, 'Cola 750ml', '8901234000097', 'bottle', '2202', 28.00, 40.00, 24, 2
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000097');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 10, 'Mango Juice 1L', '8901234000103', 'tetra', '2009', 12.00, 110.00, 10, 2
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000103');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 11, 'Packaged Drinking Water 1L', '8901234000110', 'bottle', '2201', 18.00, 20.00, 30, 2
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000110');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 12, 'Potato Chips 90g', '8901234000127', 'pack', '2005', 12.00, 50.00, 20, 3
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000127');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 13, 'Marie Biscuits 250g', '8901234000134', 'pack', '1905', 18.00, 55.00, 15, 3
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000134');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 14, 'Bath Soap 100g', '8901234000141', 'pack', '3401', 18.00, 42.00, 30, 4
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000141');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 15, 'Toothpaste 150g', '8901234000158', 'tube', '3306', 18.00, 95.00, 15, 4
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000158');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 16, 'Shampoo 340ml', '8901234000165', 'bottle', '3305', 18.00, 210.00, 8, 4
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000165');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 17, 'Paracetamol 500mg Strip', '8901234000172', 'strip', '3004', 12.00, 30.00, 25, 5
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000172');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 18, 'ORS Sachet 21g', '8901234000189', 'sachet', '3004', 12.00, 22.00, 40, 5
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000189');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 19, 'Cough Syrup 100ml', '8901234000196', 'bottle', '3004', 12.00, 145.00, 10, 5
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000196');
INSERT INTO product (id, name, barcode, unit, hsn_code, gst_rate, selling_price, reorder_level, category_id)
SELECT 20, 'Detergent Powder 1kg', '8901234000202', 'pack', '3402', 18.00, 135.00, 12, 6
WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.barcode = '8901234000202');

-- Purchases (3)
INSERT INTO purchase (id, supplier_bill_no, supplier_id, purchase_date, total)
SELECT 1, 'SD-1001', 1, CURRENT_DATE + INTERVAL '-45' DAY, 24165.00
WHERE NOT EXISTS (SELECT 1 FROM purchase p WHERE p.supplier_bill_no = 'SD-1001');
INSERT INTO purchase (id, supplier_bill_no, supplier_id, purchase_date, total)
SELECT 2, 'GW-2002', 2, CURRENT_DATE + INTERVAL '-30' DAY, 10220.00
WHERE NOT EXISTS (SELECT 1 FROM purchase p WHERE p.supplier_bill_no = 'GW-2002');
INSERT INTO purchase (id, supplier_bill_no, supplier_id, purchase_date, total)
SELECT 3, 'MP-3003', 3, CURRENT_DATE + INTERVAL '-20' DAY, 6600.00
WHERE NOT EXISTS (SELECT 1 FROM purchase p WHERE p.supplier_bill_no = 'MP-3003');

-- Purchase items
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 1, 1, 1, 20, 400.00, 'B-RICE-01', CURRENT_DATE + INTERVAL '730' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-RICE-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 2, 1, 2, 30, 140.00, 'B-DAL-01', CURRENT_DATE + INTERVAL '365' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-DAL-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 3, 1, 5, 50, 38.00, 'B-SUG-01', CURRENT_DATE + INTERVAL '540' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-SUG-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 4, 1, 7, 25, 110.00, 'B-TEA-01', CURRENT_DATE + INTERVAL '180' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-TEA-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 5, 1, 4, 15, 370.00, 'B-ATTA-01', CURRENT_DATE + INTERVAL '60' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-ATTA-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 6, 1, 6, 40, 16.00, 'B-SALT-01', CURRENT_DATE + INTERVAL '900' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-SALT-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 7, 1, 8, 25, 45.00, 'B-TUR-01', CURRENT_DATE + INTERVAL '12' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-TUR-01');

INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 8, 2, 9, 48, 30.00, 'B-COLA-01', CURRENT_DATE + INTERVAL '45' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-COLA-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 9, 2, 12, 40, 36.00, 'B-CHIPS-01', CURRENT_DATE + INTERVAL '25' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-CHIPS-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 10, 2, 13, 30, 40.00, 'B-BISC-01', CURRENT_DATE + INTERVAL '120' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-BISC-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 11, 2, 3, 20, 120.00, 'B-OIL-01', CURRENT_DATE + INTERVAL '150' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-OIL-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 12, 2, 14, 40, 30.00, 'B-SOAP-01', CURRENT_DATE + INTERVAL '90' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-SOAP-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 13, 2, 10, 20, 85.00, 'B-JUICE-01', CURRENT_DATE + INTERVAL '30' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-JUICE-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 14, 2, 11, 60, 14.00, 'B-WATER-01', CURRENT_DATE + INTERVAL '365' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-WATER-01');

INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 15, 3, 17, 100, 22.00, 'B-PARA-01', CURRENT_DATE + INTERVAL '-10' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-PARA-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 16, 3, 17, 60, 22.00, 'B-PARA-02', CURRENT_DATE + INTERVAL '400' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-PARA-02');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 17, 3, 18, 80, 15.00, 'B-ORS-01', CURRENT_DATE + INTERVAL '-5' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-ORS-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 18, 3, 19, 8, 115.00, 'B-COUGH-01', CURRENT_DATE + INTERVAL '10' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-COUGH-01');
INSERT INTO purchase_item (id, purchase_id, product_id, quantity, cost_price, batch_no, expiry_date)
SELECT 19, 3, 16, 6, 160.00, 'B-SHAM-01', CURRENT_DATE + INTERVAL '540' DAY
WHERE NOT EXISTS (SELECT 1 FROM purchase_item pi WHERE pi.batch_no = 'B-SHAM-01');

-- Stock batches (one per purchase item, same numbers, expiry varied from
-- already expired to 2 years ahead so all alerts show sample data)
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 1, 1, 'B-RICE-01', CURRENT_DATE + INTERVAL '730' DAY, 20, 400.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-RICE-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 2, 2, 'B-DAL-01', CURRENT_DATE + INTERVAL '365' DAY, 30, 140.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-DAL-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 3, 5, 'B-SUG-01', CURRENT_DATE + INTERVAL '540' DAY, 50, 38.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-SUG-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 4, 7, 'B-TEA-01', CURRENT_DATE + INTERVAL '180' DAY, 25, 110.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-TEA-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 5, 4, 'B-ATTA-01', CURRENT_DATE + INTERVAL '60' DAY, 15, 370.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-ATTA-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 6, 6, 'B-SALT-01', CURRENT_DATE + INTERVAL '900' DAY, 40, 16.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-SALT-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 7, 8, 'B-TUR-01', CURRENT_DATE + INTERVAL '12' DAY, 25, 45.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-TUR-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 8, 9, 'B-COLA-01', CURRENT_DATE + INTERVAL '45' DAY, 48, 30.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-COLA-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 9, 12, 'B-CHIPS-01', CURRENT_DATE + INTERVAL '25' DAY, 40, 36.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-CHIPS-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 10, 13, 'B-BISC-01', CURRENT_DATE + INTERVAL '120' DAY, 30, 40.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-BISC-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 11, 3, 'B-OIL-01', CURRENT_DATE + INTERVAL '150' DAY, 20, 120.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-OIL-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 12, 14, 'B-SOAP-01', CURRENT_DATE + INTERVAL '90' DAY, 40, 30.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-SOAP-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 13, 10, 'B-JUICE-01', CURRENT_DATE + INTERVAL '30' DAY, 20, 85.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-JUICE-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 14, 11, 'B-WATER-01', CURRENT_DATE + INTERVAL '365' DAY, 60, 14.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-WATER-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 15, 17, 'B-PARA-01', CURRENT_DATE + INTERVAL '-10' DAY, 100, 22.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-PARA-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 16, 17, 'B-PARA-02', CURRENT_DATE + INTERVAL '400' DAY, 60, 22.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-PARA-02');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 17, 18, 'B-ORS-01', CURRENT_DATE + INTERVAL '-5' DAY, 80, 15.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-ORS-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 18, 19, 'B-COUGH-01', CURRENT_DATE + INTERVAL '10' DAY, 8, 115.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-COUGH-01');
INSERT INTO stock_batch (id, product_id, batch_no, expiry_date, quantity, cost_price, version)
SELECT 19, 16, 'B-SHAM-01', CURRENT_DATE + INTERVAL '540' DAY, 6, 160.00, 0
WHERE NOT EXISTS (SELECT 1 FROM stock_batch b WHERE b.batch_no = 'B-SHAM-01');

-- Two invoices from today so the dashboard and reports show real numbers
INSERT INTO invoice (id, invoice_number, invoice_date, customer_name, customer_phone,
                     sub_total, discount_amount, cgst_amount, sgst_amount, gst_amount, grand_total)
SELECT 1, CONCAT('INV-', YEAR(CURRENT_DATE), '-0001'), CURRENT_TIMESTAMP, 'Sunita Devi', '9000000001',
       1060.00, 0.00, 44.90, 44.90, 89.80, 1149.80
WHERE NOT EXISTS (SELECT 1 FROM invoice i
                  WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0001'));
INSERT INTO invoice (id, invoice_number, invoice_date, customer_name, customer_phone,
                     sub_total, discount_amount, cgst_amount, sgst_amount, gst_amount, grand_total)
SELECT 2, CONCAT('INV-', YEAR(CURRENT_DATE), '-0002'), CURRENT_TIMESTAMP, 'Rahul Gupta', '9000000002',
       235.00, 10.00, 8.98, 8.97, 17.95, 242.95
WHERE NOT EXISTS (SELECT 1 FROM invoice i
                  WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0002'));

-- Invoice items (name, HSN, price and GST rate are snapshots of the product)
INSERT INTO invoice_item (id, invoice_id, product_id, stock_batch_id, product_name, hsn_code,
                          unit_price, gst_rate, quantity, discount_amount, taxable_amount,
                          gst_amount, line_total)
SELECT 1, (SELECT i.id FROM invoice i WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0001')),
       1, 1, 'Basmati Rice 5kg', '1006', 450.00, 5.00, 2, 0.00, 900.00, 45.00, 945.00
WHERE NOT EXISTS (SELECT 1 FROM invoice_item ii WHERE ii.id = 1);
INSERT INTO invoice_item (id, invoice_id, product_id, stock_batch_id, product_name, hsn_code,
                          unit_price, gst_rate, quantity, discount_amount, taxable_amount,
                          gst_amount, line_total)
SELECT 2, (SELECT i.id FROM invoice i WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0001')),
       9, 8, 'Cola 750ml', '2202', 40.00, 28.00, 4, 0.00, 160.00, 44.80, 204.80
WHERE NOT EXISTS (SELECT 1 FROM invoice_item ii WHERE ii.id = 2);
INSERT INTO invoice_item (id, invoice_id, product_id, stock_batch_id, product_name, hsn_code,
                          unit_price, gst_rate, quantity, discount_amount, taxable_amount,
                          gst_amount, line_total)
SELECT 3, (SELECT i.id FROM invoice i WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0002')),
       5, 3, 'Sugar 1kg', '1701', 45.00, 5.00, 3, 5.74, 129.26, 6.46, 135.72
WHERE NOT EXISTS (SELECT 1 FROM invoice_item ii WHERE ii.id = 3);
INSERT INTO invoice_item (id, invoice_id, product_id, stock_batch_id, product_name, hsn_code,
                          unit_price, gst_rate, quantity, discount_amount, taxable_amount,
                          gst_amount, line_total)
SELECT 4, (SELECT i.id FROM invoice i WHERE i.invoice_number = CONCAT('INV-', YEAR(CURRENT_DATE), '-0002')),
       12, 9, 'Potato Chips 90g', '2005', 50.00, 12.00, 2, 4.26, 95.74, 11.49, 107.23
WHERE NOT EXISTS (SELECT 1 FROM invoice_item ii WHERE ii.id = 4);
