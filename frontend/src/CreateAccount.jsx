import React, {useState}from 'react'
import "./CreateAccount.css"
import {useFormik} from "formik"
import * as Yup from "yup"
import axios from "axios"
import {useNavigate} from 'react-router-dom'

function CreateAccount() {
  const [error,setError]=useState("")

  const navigate=useNavigate()
  const formik=useFormik({
    initialValues:{
      fullName:"",
      email:"",
      password:""
    },

    validationSchema:Yup.object({
      fullName:Yup.string()
      .required("Required")
      .min(3,"Name cant be 3 characters or less"),
      email:Yup.string()
      .email("Invalid Email Format")
      .required("Required"),
      password:Yup.string()
      .min(8,"Password must be atleast 8 characters")
      .required("Required")
    }),

    onSubmit:(values)=>{
      setError("")
      axios.post("http://localhost:3000/signup",values)
      .then(response=>{
        console.log(response.data.message),
        formik.resetForm(),
        navigate("/login")
    })
      .catch(error => {
        if (error.response&&error.response.status===400) {
          setError(error.response.data.message)
        } else {
          setError("An error occurred")
        }
      });
    }
  })

  return (
    <>
    <div className="create-account">
      
      <div>
        <img src="/public/registerPageBackground.png"/>
      </div>
      <div id="signup">
        <h1>Create Your Account</h1>  
        <form onSubmit={formik.handleSubmit}>

          <div>
          <div id="flex">
          <label htmlFor="fullName">Full Name</label>
          {formik.touched.fullName && formik.errors.fullName && (
            <span style={{color:"red"}}>({formik.errors.fullName})</span>
          )}
           </div>
          <input type="text" id="fullName" name="fullName" value={formik.values.fullName} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
          </div>

          <div>
          <div id="flex">
          <label htmlFor="email">Email Address</label>
          {formik.touched.email && formik.errors.email && (
            <span style={{color:"red"}}>({formik.errors.email})</span>
          )}
          </div>
          <input type="email" id="email" name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
          </div>
          
          <div>
          <div id="flex">
          <label htmlFor="password">Password</label>
          {formik.touched.password && formik.errors.password && (
            <span style={{color:"red"}}>({formik.errors.password})</span>
          )}
           </div>
          <input type="password" id="password" name="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
          </div>

          <button id="signupbtn" type="submit">Sign Up</button>
        </form>

          {error && <div id="error">{error}</div>}

      </div> 
    </div>
    </>
  )
}

export default CreateAccount