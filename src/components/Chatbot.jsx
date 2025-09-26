<<<<<<< HEAD
// Footer.jsx
import "../styles/chatbot.css";

export default function Chatbot() {
    return (

        < button className="chatbot-btn" >🤖</button >
=======
// Chatbot.jsx
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/chatbot.css";

export default function Chatbot() {
    return (
        <div className="layout-chatbot">
            <Link to="/chatbot" aria-label="Mở Chatbot">
                <button className="chatbot-btn">🤖</button>
            </Link >
        </div >
>>>>>>> 3725551 (Publiclayout)
    );
}
