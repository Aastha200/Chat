import React, { useState } from 'react'
import "../Register.css"
import { Link,  useNavigate } from 'react-router-dom';
export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    let navigation = useNavigate()
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("password  not match")
            return
        }
        fetch("http://localhost:2000/register", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(formData),
        }).then((res) => {
            return res.json();
        }).then((data) => {
            if (data.status) {
                console.log("jl")
                localStorage.setItem("user", JSON.stringify(data.user));
                navigation("/login")
            }
            else {
                alert(data.message)
            }
        })
        console.log(formData);
    };
    return (
        <div>
            <div className="FormContainer">
                <div className="brand">
                    <i className="fa-regular fa-user fa-2xl" style={{color:"#74C0FC"}}></i>
                    <h1>Register</h1>
                </div>
                <form onSubmit={handleSubmit} >
                    <input type="text" placeholder="name" required name='name' value={formData.name} onChange={handleChange}/>
                    <input type="email" placeholder="mail" required name='email' value={formData.email} onChange={handleChange} />
                    <input type="password" placeholder="Password" required  name='password' value={formData.password} onChange={handleChange}/>
                    <input type="password" placeholder="Confirm Password" required name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} />
                    <button type="submit" >Register</button>
                </form>
                <div className="signup">
                    <span>Already have an account? <Link to="/login">Log In</Link></span>
                </div>
            </div>
        </div>
    )
}
