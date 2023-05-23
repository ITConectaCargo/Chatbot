import { Link } from "react-router-dom";
import styles from "./NavbarLink.module.css";

export default function NavbarLink({ url, children }) {
    return(
        <Link to={url} className={styles.link}>
            {children}
        </Link>
    )
}