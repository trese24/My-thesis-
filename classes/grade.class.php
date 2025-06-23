<?php
class Grade extends dbHandler
{
    public function __construct()
    {
        parent::__construct();
    }

    public function updateClassRecord($data)
    {
        $data = json_encode($data);
        $data = json_decode($data);
        $status = array();
        foreach ($data->students as $student) {
            $criteria = json_encode($data->criteria);
            $grade = json_encode($student->scores);
            if ($grade !== "\"\"") {
                $query = "UPDATE student_subject SET criteria='$criteria', grade='$grade', final_grade='$student->grade', 
                equiv='$student->equiv', remarks='$student->remarks' WHERE student_id='$student->studentNo' AND subject_code='$data->code'";
                if (mysqli_query($this->conn, $query)) {
                    $status[] = (object) ['status' => true, 'msg' => ''];
                } else {
                    $status[] = (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
                }
            }
        }
        return $status;
    }

    public function updateDropStatus($studentNo, $subjectCode, $status)
    {
        $query = "UPDATE student_subject SET isDrop='$status' WHERE student_id='$studentNo' AND subject_code='$subjectCode'";
        return array("status" => mysqli_query($this->conn, $query));
    }

}
