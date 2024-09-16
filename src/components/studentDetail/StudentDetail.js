import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Alert, Button, FormGroup, Input, Label, Table } from "reactstrap";
import { getAllStudentDetail, resetStatusAndMessage, uploadImage } from "../../redux/studentSlice";
import axios from "axios";

export default function StudentDetail() {
  const { id } = useParams();
  
  const [files, setFiles] = useState([]);
  const { studentDetails, message, error, status } = useSelector(
    (state) => state.student
  );
  const [images, setImages] = useState([]);
  const handle_change = (e) => {
    setFiles(e.target.files);
  };
  const [showMessage, setShowMessage] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(()=>{
    dispatch(getAllStudentDetail(id))
  }, [dispatch, id])
  const handle_submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    try {
      await dispatch(uploadImage({ id, formData })).unwrap();
      dispatch(getAllStudentDetail(id))
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };

  const fetchImage = async (imageUrl) =>{
    try {
        const url = `http://localhost:8080/student/images/${imageUrl}`
        const response = await axios.get(url, {
            responseType: 'blob'
        })
        const imageObjectUrl = URL.createObjectURL(response.data)
        setImages(prev => ({...prev, [imageUrl]: imageObjectUrl}))
    } catch (error) {
        console.error("Error fetching image", error);
    }
  }

  useEffect(()=>{
    if (studentDetails){
        studentDetails.forEach(item => {
            fetchImage(item.imageUrl)
        });
    }
  }, [studentDetails, dispatch]);

  useEffect(() => {
    if (status && message) {
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
        dispatch(resetStatusAndMessage()); // Reset status and message
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, message, dispatch]);

  return (
    <div>
      <h1>Id: {id}</h1>
      <form onSubmit={handle_submit}>
        <FormGroup>
          <Label>Upload Image</Label>
          <Input type="file" name="files" multiple onChange={handle_change} />
          <Input type="submit" value="Save" />
        </FormGroup>
      </form>
      {showMessage && (
        <Alert color={status === 200 ? "success" : "danger"}>{message}</Alert>
      )}
      {error && (
        <Alert color="danger">
          <ul>
            {error.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      <Table hover>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Image</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {studentDetails &&
            studentDetails.map((item, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{item.id}</td>

                <td>
                  <img src={images[item.imageUrl]} alt="Student Image" style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                </td>
                <td>
                  <Button className="btn btn-danger">
                    <i class="fa-solid fa-delete-left"></i>
                  </Button>
                </td>
              </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
