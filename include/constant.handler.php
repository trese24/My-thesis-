<?php
const ENABLE_MAIL = true; // set 'true' to enable sending email

const ADMIN = "admin";
const FACULTY = "faculty";
const STUDENT = "student";
const DEPTHEAD = "depthead";

const BLOCKED = "blocked";
const ACTIVE = "active";
const DELETED = "deleted";
const DEFAULT_ATTEMPT = 2; // 3 login attempts. zero based

// CONST FOR STUDENT FILE UPLOAD 
const STUDENT_STUDENT_NO = 0;
const STUDENT_FULLNAME = 1;
const STUDENT_GENDER = 2;
const STUDENT_EMAIL = 3;
const STUDENT_CONTACT_NO = 4;
const STUDENT_PROGRAM = 5;
const STUDENT_LEVEL = 6;
const STUDENT_SECTION = 7;
const STUDENT_SPECIALIZATION = 8;

// CONST FOR FACULTY FILE UPLOAD 
const FACULTY_ID = 0;
const FACULTY_FULLNAME = 1;
const FACULTY_EMAIL = 2;
const FACULTY_CONTACT_NO = 3;
const FACULTY_SUBJECTS = 4;
const FACULTY_SECTION = 5;
