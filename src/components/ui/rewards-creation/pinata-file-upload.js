import { useState } from "react";
import axios from "axios";
const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYmJjN2JlMi03YTYyLTRmYWMtODcwYy0xZWU5ZDcwMDcwNjYiLCJlbWFpbCI6Im5pa2xhc0BlZWRlZS5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODQ3NjAwODllNzA3MzYyMmRmODUiLCJzY29wZWRLZXlTZWNyZXQiOiI4NjIzYTk2ODUyZTcwNGU4NjdlNDlhNmEwNTJmYmFiMTY0Y2YzNmVlYzY1Y2Y2ODBmOGIwNmU4MjNiZDFmM2ZhIiwiaWF0IjoxNjgyNDEwMzk5fQ.1T4KBu1kRQas5xm8Q8Jop1Z3O7TJHRyDhOUT7ZG_M4Y`;

const PinataFileUpload = (props) => {
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    const formData = new FormData();

    formData.append("file", selectedFile);

    const metadata = JSON.stringify({
      name: "File name",
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT,
          },
        }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <label className="form-label">Choose File</label>
      <input type="file" onChange={changeHandler} {...props} />
      <button onClick={handleSubmission}>Submit</button>
    </>
  );
};

export default PinataFileUpload;
