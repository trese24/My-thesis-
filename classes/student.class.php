<?php
class Student extends dbHandler
{
    private $id;
    private $studentInfo;
    public function __construct()
    {
        parent::__construct();
        $arguments = func_get_args();
        if (!empty($arguments)) {
            call_user_func_array(array($this, "withID"), $arguments);
        } else {
            $this->studentInfo = $this->getAllStudent();
        }
    }

    // PUBLIC FUNCTIONS

    public function addStudentFromFile($data)
    {
        $data = json_encode($data);
        $data = json_decode($data);
        $query = "INSERT INTO student(id, fullName, username, email, password, contact_no, gender, specialization, program, level, section) VALUES ";
        $sql = "INSERT INTO student_subject(student_id, subject_code, criteria) VALUES";
        $subjects = new Subject();
        $subs = $subjects->getAllSubject();
        $status = array();
        $has_student = false;
        $emailSendCtr = 5;
        foreach ($data->body as $eachData) {
            $email = strtolower($eachData[STUDENT_EMAIL]);
            if ($this->isEmailExist($email)) {
                $status[] = (object) ['status' => false, 'msg' => '<b>' . $email . '</b> is already exist'];
            } else {
                $username = explode("@", $email)[0];
                $password = $this->generateRandomPassword();
                if (ENABLE_MAIL) {
                    if ($emailSendCtr > 0) {
                        $emailSendCtr--;
                        $mail = new Mail(ADMIN);
                        $mail->sendCredentials($email, $username, $password);
                    }
                }
                $query .= "(
                    '" . $eachData[STUDENT_STUDENT_NO]      . "',
                    '" . $eachData[STUDENT_FULLNAME]        . "', 
                    '$username', '$email', '$password', 
                    '" . $eachData[STUDENT_CONTACT_NO]      . "', 
                    '" . $eachData[STUDENT_GENDER]          . "', 
                    '" . $eachData[STUDENT_SPECIALIZATION]  . "', 
                    '" . $eachData[STUDENT_PROGRAM]         . "', 
                    '" . $eachData[STUDENT_LEVEL]           . "', 
                    '" . $eachData[STUDENT_SECTION]         . "'),";
                $has_student = true;
                $criteria = new Criteria();
                $content = $criteria->getSetupDefaultCriteria();
                foreach ($subs as $s) {
                    $sql .= "('" . $eachData[STUDENT_STUDENT_NO] . "', '$s->code', '$content'),";
                }
            }
        }
        $sql = rtrim($sql, ",");
        $query = rtrim($query, ",");
        if ($has_student) {
            if (mysqli_query($this->conn, $query)) {
                if (mysqli_query($this->conn, $sql)) {
                    $status[] = (object) ['status' => true, 'msg' => ''];
                } else {
                    $status[] = (object) ['status' => false, 'sql' => $sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
                }
            } else {
                $status[] = (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
        return $status;
    }

    public function addNewStudent($details)
    {
        $username = explode("@", $details->email)[0];
        $password = $this->generateRandomPassword();
        if ($this->isEmailExist($details->email)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "INSERT INTO student(id, fullName, username, email, password, contact_no, gender, specialization, program, level, section) VALUES 
                ('$details->id', '$details->fullName', '$username', '$details->email', '$password', '$details->contactNo', '$details->gender', '$details->specialization', '$details->program', '$details->level', '$details->section')";
            $subjects = new Subject();
            $subs = $subjects->getAllSubject();
            if (mysqli_query($this->conn, $query)) {
                $sql = "INSERT INTO student_subject(student_id, subject_code, criteria) VALUES";
                $criteria = new Criteria();
                $content = $criteria->getSetupDefaultCriteria();
                foreach ($subs as $s) {
                    $sql .= "('" . $details->id . "', '$s->code', $content),";
                }
                $sql = rtrim($sql, ",");
                if (mysqli_query($this->conn, $sql)) {
                    if (ENABLE_MAIL) {
                        $mail = new Mail(ADMIN);
                        $mail->sendCredentials($details->email, $username, $password);
                    }
                    return (object) ['status' => true, 'msg' => ''];
                } else {
                    return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
                }
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function editStudent($details)
    {
        if ($this->isEmailExist($details->email, $details->id_old)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "UPDATE `student` SET `id`='$details->id',`fullName`='$details->fullName',`contact_no`='$details->contactNo',`gender`='$details->gender',`specialization`='$details->specialization',`program`='$details->program',`level`='$details->level',`section`='$details->section'/* ,`subjects`='$details->subjects' */ WHERE id='$details->id_old'";
            if (mysqli_query($this->conn, $query)) {
                return (object) ['status' => true, 'msg' => ''];
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function editStudentProfile($details)
    {
        if ($this->isEmailExist($details->email, $details->id_old)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "UPDATE `student` SET `contact_no`='$details->contactNo', `email`='$details->email', `username`='$details->username', `password`='$details->password', `profile_picture`='$details->profile' WHERE id='$details->id_old'";
            if (mysqli_query($this->conn, $query)) {
                return (object) ['status' => true, 'msg' => ''];
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function removeStudent($studentNo)
    {
        $query = "UPDATE `student` SET `status`='deleted' WHERE id='$studentNo'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ['status' => true, 'msg' => ''];
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }

    public function getDestinctProgram()
    {
        $prog = array();
        $query = "SELECT DISTINCT(program) FROM student";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result))
                array_push($prog, $row["program"]);
        }
        return $prog;
    }

    public function getSections($level)
    {
        $prog = array();
        $query = "SELECT DISTINCT(section) FROM student WHERE level='$level'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result))
                array_push($prog, $row["section"]);
        }
        return $prog;
    }

    private function withID($id)
    {
        $this->id = $id;
        $query = "SELECT * FROM student WHERE id=$id";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            $this->studentInfo = $this->setStudentInfo($result);
            return $this->studentInfo;
        } else {
        }
    }

    private function getAllStudent()
    {
        $query = "SELECT * FROM student WHERE status='" . ACTIVE . "' AND level != 'Alumni'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            return $this->setStudentInfo($result);
        }
    }

    public function getHandledStudent($facultyID)
    {
        $query = "SELECT * FROM student WHERE section IN (SELECT faculty_subject.sections FROM `faculty_subject` WHERE faculty_id=$facultyID) AND status='" . ACTIVE . "'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            return $this->setStudentInfo($result, $facultyID);
        }
    }

    public function getStudentInfo()
    {
        return $this->studentInfo;
    }

    private function setStudentInfo($result, $facultyID = 0)
    {
        $students = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $subjects = array();
            $id = $row['id'];
            $query = "SELECT student_subject.*, subject.description, subject.year_level, subject.semester 
                FROM `student_subject` INNER JOIN subject on student_subject.subject_code=subject.code WHERE student_subject.student_id=$id";
            if ($facultyID) {
                $query = "SELECT student_subject.*, subject.description, subject.year_level, subject.semester FROM `student_subject` INNER JOIN subject on student_subject.subject_code=subject.code WHERE student_subject.student_id=$id AND subject_code IN (SELECT faculty_subject.subject_code FROM `faculty_subject` WHERE faculty_id=$facultyID)";
            }
            $res = mysqli_query($this->conn, $query);
            if (mysqli_num_rows($res)) {
                while ($subrow = mysqli_fetch_assoc($res)) {
                    $subjects[] = (object) [
                        "code" => $subrow["subject_code"],
                        "description" => $subrow['description'],
                        "level" => $subrow['year_level'],
                        "semester" => $subrow['semester'],
                        "grade" => $subrow['final_grade'],
                        "equiv" => $subrow['equiv'],
                        "remarks" => $subrow['remarks'],
                        "isDrop" => filter_var($subrow['isDrop'], FILTER_VALIDATE_BOOLEAN),
                        "criteria" => json_decode($subrow['criteria']),
                        "scores" => json_decode($subrow['grade'])
                    ];
                }
            }

            $students[] = (object) [
                'studentNo' => $id,
                'fullName' => $row['fullName'],
                'username' => $row['username'],
                'email' => $row['email'],
                'contact_no' => $row['contact_no'],
                'gender' => $row['gender'],
                'specialization' => $row['specialization'],
                'program' => $row['program'],
                'level' => $row['level'],
                'section' => $row['section'],
                'subjects' => $subjects,
                'profile_picture' => $row['profile_picture'],
                'status' => $row['status'],
            ];
        }
        return $students;
    }

    private function isEmailExist($email, $id = "")
    {
        $query = 'SELECT id FROM `student` WHERE email="' . $email . '" AND id!="' . $id . '"';
        $result = mysqli_query($this->conn, $query);
        return mysqli_num_rows($result);
    }

    private function generateRandomPassword(): string
    {
        $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz!@#$%&*';
        return substr(str_shuffle($data), 0, 8);
    }

    public function getBlockedStudent()
    {
        $query = "SELECT * FROM student WHERE status='" . BLOCKED . "'";
        $result = mysqli_query($this->conn, $query);
        $data = array();
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = (object) [
                    "studentNo" => $row['id'],
                    "fullName" => $row['fullName'],
                    "email" => $row['email'],
                    "contact_no" => $row['contact_no'],
                    'specialization' => $row['specialization'],
                    'program' => $row['program'],
                    'level' => $row['level'],
                    'section' => $row['section'],
                ];
            }
        }
        return $data;
    }

    public function unblockStudent($id)
    {
        $query = "UPDATE `student` SET `status`='" . ACTIVE . "', `attempt`='2' WHERE id='$id'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ['status' => true, 'msg' => ''];
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }
    public function alumniStudent()
    {
        $query = "SELECT * FROM student WHERE level='Alumni'";
        $result = mysqli_query($this->conn, $query);
        $data = array();
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = (object) [
                    "studentNo" => $row['id'],
                    "fullName" => $row['fullName'],
                    "email" => $row['email'],
                    "contact_no" => $row['contact_no'],
                    'specialization' => $row['specialization'],
                    'program' => $row['program'],
                    'level' => $row['level'],
                    'section' => $row['section'],
                    'gender' => $row['gender'],
                    'profile_picture' => $row['profile_picture'],
                ];
            }
        }
        return $data;
    }

    public function updateYearLevel($flag = true)
    {
        foreach ($this->studentInfo as $key => $student) {
            $newLevel = $student->level;
            $secNum = (int)mb_substr($student->section, 0, 1);
            $secLet = mb_substr($student->section, 1, 1);
            $section = $student->section;
            if ($flag) {
                if (strtoupper($student->level) != "4TH YEAR") {
                    $section = ($secNum + 1) . $secLet;
                }
                switch (strtoupper($student->level)) {
                    case "1ST YEAR":
                        $newLevel = "2nd year";
                        break;
                    case "2ND YEAR":
                        $newLevel = "3rd year";
                        break;
                    case "3RD YEAR":
                        $newLevel = "4th year";
                        break;
                    case "4TH YEAR":
                        $newLevel = "Alumni";
                        break;
                    default:
                        # code...
                        break;
                }
            } else {
                if (strtoupper($student->level) != "1ST YEAR") {
                    $section = ($secNum - 1) . $secLet;
                }
                switch (strtoupper($student->level)) {
                    case "2ND YEAR":
                        $newLevel = "1st year";
                        break;
                    case "3RD YEAR":
                        $newLevel = "2nd year";
                        break;
                    case "4TH YEAR":
                        $newLevel = "3rd year";
                        break;
                    default:
                        # code...
                        break;
                }
            }
            $query = "UPDATE `student` SET `level`='$newLevel', section='$section' WHERE id='$student->studentNo'";
            mysqli_query($this->conn, $query);
        }
        return (object) ['status' => true];
    }
}
