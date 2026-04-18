import axios from "axios";

async function main() {
    const projectId = "capstoneproject-f1344";
    const uid = "88Wa4IFZY9PrNOGGTijiv0H2nCDT2"; // Full UID

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=uid&updateMask.fieldPaths=email&updateMask.fieldPaths=name&updateMask.fieldPaths=role`;

    const body = {
        name: `projects/${projectId}/databases/(default)/documents/users/${uid}`,
        fields: {
            uid: { stringValue: uid },
            email: { stringValue: "SKSWadmin@shrikrishnasteelwork.in" },
            name: { stringValue: "Super Admin" },
            role: { stringValue: "admin" }
        }
    };

    try {
        const res = await axios.patch(firestoreUrl, body);
        console.log("✔ Successfully updated Firestore REST API!", res.data.fields.role.stringValue);
    } catch (err) {
        console.error("error patching firestore", err.response?.data || err.message);
    }
}
main();
