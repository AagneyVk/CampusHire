USE campushire;
DELIMITER $$

CREATE TRIGGER trg_application_before_insert
BEFORE INSERT ON applications FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20); DECLARE v_deadline DATETIME;
  SELECT status, application_deadline INTO v_status,v_deadline FROM internships WHERE internship_id=NEW.internship_id;
  IF v_status IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Internship does not exist'; END IF;
  IF v_status <> 'active' OR v_deadline <= NOW() THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Applications are closed for this internship'; END IF;
END$$

CREATE TRIGGER trg_offer_before_insert
BEFORE INSERT ON offers FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  SELECT status INTO v_status FROM applications WHERE application_id=NEW.application_id;
  IF v_status NOT IN ('shortlisted','interview','offered') THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Offer requires a successful application'; END IF;
END$$

CREATE TRIGGER trg_record_before_insert
BEFORE INSERT ON internship_records FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  SELECT status INTO v_status FROM offers WHERE offer_id=NEW.offer_id;
  IF v_status <> 'accepted' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Internship record requires accepted offer'; END IF;
END$$

CREATE TRIGGER trg_evaluation_before_insert
BEFORE INSERT ON evaluations FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  SELECT status INTO v_status FROM internship_records WHERE record_id=NEW.record_id;
  IF v_status <> 'completed' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Evaluation requires completed internship'; END IF;
END$$
DELIMITER ;
