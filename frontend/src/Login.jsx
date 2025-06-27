import React,{useState} from 'react'
import "./Login.css"
import {useFormik} from "formik"
import * as Yup from "yup"
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

function Login() {
  const [error,setError]=useState("")

    const navigate=useNavigate()
    const formik=useFormik({
        initialValues:{
          email:"",
          password:""
        },
    
        validationSchema:Yup.object({
          email:Yup.string()
          .email("Invalid Email Format")
          .required("Required"),
          password:Yup.string()
          .min(8,"Password must be atleast 8 characters")
          .required("Required")
        }),
    
        onSubmit:(values)=>{
          setError("")
          axios.post("http://localhost:3000/login",values)
          .then(response=>{
            console.log(response.data.message),
            formik.resetForm(),
            localStorage.setItem("userId", response.data.userId),
            navigate("/dashboard")
        })
          .catch(error=>{
            if (error.response){
              setError(error.response.data.message)
            } else {
              setError("An error occurred")
            }
          });
        }
      })

  return (
    <>
    <div className="login">
      
      <div>
        <img src="/public/registerPageBackground.png"/>
      </div>
      <div id="login">
        <h1>Login</h1>  
        <form onSubmit={formik.handleSubmit}>
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

          <button id="loginbtn" type="submit">Login</button>
        </form>

        {error && <div id="error">{error}</div>}

      </div> 
    </div>
    </>
  )
}

export default Login