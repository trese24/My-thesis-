<?php
class Faculty extends dbHandler
{
    private $id;
    private $facultyInfo;
    public function __construct()
    {
        parent::__construct();
        $arguments = func_get_args();
        if (!empty($arguments)) {
            call_user_func_array(array($this, "withID"), $arguments);
        } else {
            $this->facultyInfo = $this->getAllFaculty();
        }
    }

    // PUBLIC FUNCTIONS


    public function addFacultyFromFile($data)
    {
        $data = json_encode($data);
        $data = json_decode($data);
        $sub_sec_sql = "INSERT INTO faculty_subject(faculty_id, subject_code, sections) VALUES ";
        $status = array();
        $tempID = "";
        $emailSendCtr = 5; // WORK AROUND: Should be remove
        foreach ($data->body as $eachData) {
            if ($tempID != $eachData[FACULTY_ID]) {
                $tempID = $eachData[FACULTY_ID];
                $email = strtolower($eachData[FACULTY_EMAIL]);
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
                    $faculty_query = "INSERT INTO faculty(id, fullName, username, email, password, contact_no) 
                    VALUES ('" . $eachData[FACULTY_ID] . "','" . $eachData[FACULTY_FULLNAME] . "', 
                    '$username', '$email', '$password', '" . $eachData[FACULTY_CONTACT_NO] . "')";
                    if (mysqli_query($this->conn, $faculty_query)) {
                        $status[] = (object) ['status' => true, 'msg' => ''];
                    } else {
                        $status[] = (object) ['status' => false, 'sql' => $faculty_query, 'msg' => "Error description: " . mysqli_error($this->conn)];
                    }
                }
            }
            foreach (explode(", ", $eachData[FACULTY_SECTION]) as $section) {
                $sub_sec_sql .= "('" . $eachData[FACULTY_ID] . "','" . $eachData[FACULTY_SUBJECTS] . "','$section'),";
            }
        }
        $sub_sec_sql = rtrim($sub_sec_sql, ",");
        if (mysqli_query($this->conn, $sub_sec_sql)) {
            $status[] = (object) ['status' => true, 'msg' => ''];
        } else {
            $status[] = (object) ['status' => false, 'sql' => $sub_sec_sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
        return $status;
    }

    public function addNewFaculty($details)
    {
        $username = explode("@", $details->email)[0];
        $password = $this->generateRandomPassword();
        if ($this->isEmailExist($details->email)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "INSERT INTO faculty(id, fullName, username, email, password, contact_no) VALUES 
                ('$details->id', '$details->fullName', '$username', '$details->email', '$password', '$details->contactNo')";
            if (mysqli_query($this->conn, $query)) {
                $sub_sec_sql = "INSERT INTO faculty_subject(faculty_id, subject_code, sections) VALUES ";
                foreach ($details->sub_sec as $eachData) {
                    foreach (explode(", ", $eachData->sections) as $section) {
                        $sub_sec_sql .= "('$details->id', '$eachData->subject', '$section'),";
                    }
                }
                $sub_sec_sql = rtrim($sub_sec_sql, ",");
                if (mysqli_query($this->conn, $sub_sec_sql)) {
                    if (ENABLE_MAIL) {
                        $mail = new Mail(ADMIN);
                        $mail->sendCredentials($details->email, $username, $password);
                    }
                    return (object) ['status' => true, 'msg' => ''];
                } else {
                    return (object) ['status' => false, 'sql' => $sub_sec_sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
                }
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function editFaculty($details)
    {
        if ($this->isEmailExist($details->email, $details->id_old)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "UPDATE `faculty` SET `id`='$details->id',`fullName`='$details->fullName',`contact_no`='$details->contactNo', `email`='$details->email' WHERE id='$details->id_old'";
            if (mysqli_query($this->conn, $query)) {
                $delete_sql = "DELETE FROM faculty_subject WHERE faculty_id='$details->id'";
                if (mysqli_query($this->conn, $delete_sql)) {
                    $sub_sec_sql = "INSERT INTO faculty_subject(faculty_id, subject_code, sections) VALUES ";
                    foreach ($details->sub_sec as $eachData) {
                        $sub_sec_sql .= "('$details->id', '$eachData->subject', '$eachData->sections'),";
                    }
                    $sub_sec_sql = rtrim($sub_sec_sql, ",");
                    if (mysqli_query($this->conn, $sub_sec_sql)) {
                        return (object) ['status' => true, 'msg' => ''];
                    } else {
                        return (object) ['status' => false, 'sql' => $sub_sec_sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
                    }
                } else {
                    return (object) ['status' => false, 'sql' => $delete_sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
                }
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function editFacultyProfile($details)
    {
        if ($this->isEmailExist($details->email, $details->id_old)) {
            return (object) ['status' => false, 'msg' => "Email Address is already exist!"];
        } else {
            $query = "UPDATE `faculty` SET `fullName`='$details->fullName',`contact_no`='$details->contactNo', `email`='$details->email', `username`='$details->username', `password`='$details->password', `profile_picture`='$details->profile' WHERE id='$details->id_old'";
            if (mysqli_query($this->conn, $query)) {
                return (object) ['status' => true, 'msg' => ''];
            } else {
                return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        }
    }

    public function removeFaculty($facultyID)
    {
        $query = "UPDATE `faculty` SET `status`='deleted' WHERE id='$facultyID'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ['status' => true, 'msg' => ''];
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }

    public function getDestinctProgram()
    {
        $prog = array();
        $query = "SELECT DISTINCT(program) FROM faculty";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result))
                array_push($prog, $row["program"]);
        }
        return $prog;
    }

    public function getSections($program, $level)
    {
        $prog = array();
        $query = "SELECT DISTINCT(section) FROM faculty WHERE program='$program' AND level='$level'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result))
                array_push($prog, $row["section"]);
        }
        return $prog;
    }

    public function getSectionBySubjectCode($facultyID, $subjectCode)
    {
        $sub_sec = array();
        $query = "SELECT faculty_subject.*, subject.description FROM `faculty_subject` INNER JOIN subject ON subject_code=code WHERE faculty_id=$facultyID";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $sub_sec[] = (object) [
                    "code" => $row['subject_code'],
                    "description" => $row['description'],
                    "sections" => $row['sections'],
                ];
            }
        }

        return $sub_sec;
    }


    // PRIVATE FUNCTIONS

    private function withID($id)
    {
        $this->id = $id;
        $query = "SELECT * FROM faculty WHERE id=$id";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            $this->facultyInfo = $this->setFacultyInfo($result);
            return $this->facultyInfo;
        }
    }

    private function getAllFaculty()
    {
        $query = "SELECT * FROM faculty WHERE status='" . ACTIVE . "'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            return $this->setFacultyInfo($result);
        }
    }

    public function getBlockedFaculty()
    {
        $query = "SELECT * FROM faculty WHERE status='" . BLOCKED . "'";
        $result = mysqli_query($this->conn, $query);
        $data = array();
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = (object) [
                    "id" => $row['id'],
                    "fullName" => $row['fullName'],
                    "email" => $row['email'],
                    "contact_no" => $row['contact_no'],
                ];
            }
        }
        return $data;
    }

    public function unblockFaculty($id)
    {
        $query = "UPDATE `faculty` SET `status`='" . ACTIVE . "', `attempt`='2' WHERE id='$id'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ['status' => true, 'msg' => ''];
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }

    public function getFacultyInfo()
    {
        return $this->facultyInfo;
    }

    private function setFacultyInfo($result)
    {
        $faculties = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $sub_sec = array();
            $id = $row['id'];
            $query = "SELECT * FROM faculty_subject WHERE faculty_id='$id'";
            $result2 = mysqli_query($this->conn, $query);
            if (mysqli_num_rows($result2)) {
                while ($row2 = mysqli_fetch_assoc($result2)) {
                    $code = $row2['subject_code'];
                    $query2 = "SELECT description FROM subject WHERE code='$code'";
                    $res = mysqli_query($this->conn, $query2);
                    if (mysqli_num_rows($res)) {
                        $subrow = mysqli_fetch_assoc($res);
                        $sub_sec[] = (object) [
                            "code" => $code,
                            "description" => $subrow['description'],
                            "sections" => $row2['sections'],
                        ];
                    }
                }
            }

            $faculties[] = (object) [
                'facultyID' => $id,
                'fullName' => $row['fullName'],
                'username' => $row['username'],
                'email' => $row['email'],
                'contact_no' => $row['contact_no'],
                'profile_picture' => $row['profile_picture'],
                'status' => $row['status'],
                'sub_sec' => $sub_sec,
            ];
        }
        return $faculties;
    }

    public function getSubjectSection($id)
    {
        $sub_sec = array();
        $query = "SELECT * FROM faculty_subject WHERE faculty_id='$id' GROUP BY subject_code";
        $result2 = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result2)) {
            while ($row2 = mysqli_fetch_assoc($result2)) {
                $code = $row2['subject_code'];
                $query2 = "SELECT description FROM subject WHERE code='$code'";
                $res = mysqli_query($this->conn, $query2);
                if (mysqli_num_rows($res)) {
                    $subrow = mysqli_fetch_assoc($res);
                    $sub_sec[] = (object) [
                        "code" => trim($code),
                        "description" => $subrow['description'],
                        "sections" => $row2['sections'],
                    ];
                }
            }
        }
        return $sub_sec;
    }

    private function isEmailExist($email, $id = "")
    {
        $query = 'SELECT id FROM `faculty` WHERE email="' . $email . '" AND id!="' . $id . '"';
        $result = mysqli_query($this->conn, $query);
        return mysqli_num_rows($result);
    }

    private function generateRandomPassword(): string
    {
        $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz!@#$%&*';
        return substr(str_shuffle($data), 0, 8);
    }
}
