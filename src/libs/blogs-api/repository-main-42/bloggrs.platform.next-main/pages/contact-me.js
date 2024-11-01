import Link from "next/link";
import { useState } from "react";
import { createBlogContact } from "../lib/bloggrs-sdk";
import * as yup from 'yup';

const schema = yup.object().shape({
    first_name: yup.string().min(2).required(),
    last_name: yup.string().min(2).required(),
    email: yup.string().min(2).email().required(),
    content: yup.string().min(2).required(),
})

export default function ContactMe(){
    const [ data, setData ] = useState({
        first_name: "",
        last_name: "",
        email: "",
        content: ""
    })
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ success, setSuccess ] = useState(undefined)

    const validFormData = schema.isValidSync(data);

    const onSubmitHandler = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log({ data })
        await createBlogContact(data)
        
        setIsSubmitting(false);
        setSuccess(true);
    }
    const onChange = key => e => setData({ ...data, [key]: e.target.value })
    
    const formDisabled = !validFormData || isSubmitting
    console.log({ formDisabled })
    return (
        <div className="flex-grid">
            <div className="col-offset-2 col-4">
                <div class="panel">
                    <div class="panel-header">
                        Contact Me
                        {/* <small><a>you can login for a better experience</a></small> */}
                    </div>
                    <div class="panel-body">
                        {
                            success && <>
                                Message received! We will see it as soon as we can.
                            </>
                        }
                        <form onSubmit={onSubmitHandler} style={success ? { display: "none" } : null} disabled={formDisabled}>
                            <div style={{ gap: 15, display: "grid" }}>
                                <label>
                                    First Name: <input onChange={onChange("first_name")} value={data.first_name} type="text" placeholder="Enter text here.."/>
                                </label>
                                <label>
                                    Last Name: <input onChange={onChange("last_name")} value={data.last_name} type="text" placeholder="Enter text here.."/>
                                </label>
                                <label>
                                    Email: <input onChange={onChange("email")} value={data.email} type="text" placeholder="Enter text here.."/>
                                </label>
                                <label>
                                    Content: <input onChange={onChange("content")} value={data.content} type="text" placeholder="Enter text here.."/>
                                </label>
                            </div>
                        <button 
                            disabled={formDisabled}
                            style={{ width: "50%", marginTop: 15 }} 
                            type="submit"
                        >Send</button>
                        </form>
                    </div>
                    <div class="panel-footer">
                        Powered by <Link href="https://bloggrs.com/"><a>bloggrs</a></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}