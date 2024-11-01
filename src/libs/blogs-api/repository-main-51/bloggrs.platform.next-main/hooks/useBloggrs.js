import { useEffect, useState } from "react";

const useBloggrs = () => {
    const [ bloggrs, setBloggrs ] = useState(null);

    useEffect(() => {
        const bloggrs_instance = window.__bloggrs__;
        setBloggrs(bloggrs_instance);
    }, [])
    return bloggrs;
}

export default useBloggrs;