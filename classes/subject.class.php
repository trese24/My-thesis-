<?php
class Subject extends dbHandler
{
    private $subjects = array();
    public function __construct($studentID = '', $currentEnroled = false)
    {
        parent::__construct();
        if ($studentID == '') {
            $query = "SELECT * FROM subject";
        } elseif ($currentEnroled) {
            $query = "SELECT subject.* FROM `subject` INNER JOIN student ON student.level=subject.year_level WHERE student.id=$studentID";
        } else {
            $query = "SELECT subject.* FROM `subject` INNER JOIN student_subject ON subject.code=student_subject.subject_code WHERE student_subject.student_id='$studentID'";
        }
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $id = $row['id'];
                $this->subjects[] = (object)[
                    'id' => $id,
                    'code' => $row['code'],
                    'description' => $row['description'],
                    'year_level' => $row['year_level'],
                    'semester' => $row['semester'],
                    'specialization' => $row['specialization'],
                    'lec_units' => $row['lec_units'],
                    'lab_units' => $row['lab_units'],
                    'total_units' => $row['total_units'],
                    'hours_per_week' => $row['hours_per_week'],
                    'prereq' => $row['prereq'],
                    'coreq' => $row['co_req']
                ];
            }
        }
    }

    public function getAllSubject()
    {
        return $this->subjects;
    }

    public function removeSubject($id)
    {
        $query = "DELETE FROM `subject` WHERE id='$id'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ["status" => true, "msg" => ''];
        } else {
            return (object) ["status" => false, "msg" => mysqli_error($this->conn)];
        }
    }

    public function updateSubject($info)
    {
        $info = json_decode($info);
        $year_level = explode('-', $info->editYearSem)[0];
        $sem = explode('-', $info->editYearSem)[1];

        $query = "UPDATE subject SET code='$info->editCode', description='$info->editDescription', year_level='$year_level', semester='$sem', specialization='$info->editSpecialization', lec_units='$info->editLecUnits', lab_units='$info->editLabUnits', hours_per_week='$info->editHoursPerWeek', prereq='$info->editPrereq', co_req='$info->editCoReq' WHERE id='$info->editID'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ["status" => true, "msg" => ''];
        } else {
            return (object) ["status" => false, "msg" => mysqli_error($this->conn)];
        }
    }

    public function addNewSubject($info)
    {
        $info = json_decode($info);
        $year_level = explode('-', $info->addYearSem)[0];
        $sem = explode('-', $info->addYearSem)[1];

        $query = "INSERT INTO `subject`(`code`, `description`, `year_level`, `semester`, `specialization`, 
        `lec_units`, `lab_units`, `hours_per_week`, `prereq`, `co_req`) VALUES ('$info->addCode','$info->addDescription',
        '$year_level','$sem','$info->addSpecialization','$info->addLecUnits','$info->addLabUnits','$info->addHoursPerWeek','$info->addPrereq','$info->addCoReq')";
        if (mysqli_query($this->conn, $query)) {
            $status = (object) ['status' => true, 'msg' => ''];
        } else {
            $status = (object) ['status' => false, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
        return $status;
    }
}
