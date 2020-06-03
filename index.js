//Load HTTP module
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Setup axios
axios.defaults.baseURL = 'https://www.wrike.com/api/v4';
axios.defaults.headers.common['Authorization'] = `bearer ${process.env.WRIKE_APP_PERMANENT_TOKEN}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

//  Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const commentTypes = {
    folderComment: 'folderComment',
    taskComment: 'taskComment',
    unknown: 'unknown'
}

// Translation service
const {Translate, TranslateRequest} = require('@google-cloud/translate').v2;
const translate = new Translate();

const translateText = async (text, option) => {
    const [translations] = await translate.translate(text, option)
    return translations
}

const tarnslateToJa = async (text) => {
    return await translateText(text, { to: 'ja', from: 'en' })
}

// bot response
// edit / put the comment with ja translation
const addCommentWithJaTranslation = async (data, commentType) => {
    console.debug(JSON.stringify(data, null, 4))

    // const taskId = data.taskId;
    // const folderId = data.folderId;
    // const commentId = data.commentId;
    
    // const apiEndPoint = `/comments/${commentId}`; // Update comment API url
    // const apiEndPoint = `/tasks/${taskId}/comments`; // Post task comment API url
    // const apiEndPoint = `/folders/${folderId}/comments`; // Post folder comment API url

    const apiEndPoint = commentType == commentTypes.folderComment ?
        `/folders/${data.folderId}/comments` : commentType == commentTypes.taskComment ?
            `/tasks/${data.taskId}/comments` : undefined

    if (apiEndPoint == undefined) return false;

    const commentText = data.comment.html;

    // Translation service
    tarnslateToJa(commentText)
        .then((result) => {
            if (result) {
                let translatedJaStr = result;

                const newTranslatedComment =
                    `#${process.env.WRIKE_APP_NAME}によるトランス <br/>
                ---------------------------------------
                <br/>
                ${translatedJaStr}`;

                console.debug(`responding with message: ${newTranslatedComment}`)

                axios
                    .post(apiEndPoint, {
                        plainText: false,
                        text: newTranslatedComment
                    })
                    .catch((error) => console.debug(error))
            }
        })
        .catch((error) => console.debug(error))

    return true;
}

/**
 * Identify comment event type
 * @param {object} data 
 */
const identifyCommentType = (data) => {
    return data.eventType == 'FolderCommentAdded' ?
        commentTypes.folderComment : data.eventType == 'CommentAdded' ?
            commentTypes.taskComment : commentTypes.unknown;
}

const identifyIfUsersCommentEvent = async (data) => {
    let isComment = (data.eventType == 'CommentAdded' || data.eventType == 'FolderCommentAdded')
        ? true : false;
    let isMyComment = (data.comment.html.includes(`#${process.env.WRIKE_APP_NAME}`)) ? true : false;
    return (isComment && !isMyComment)
        ? Promise.resolve()
        : Promise.reject({ message: 'Avoiding loop!' });
}

app.get('/', (req, res) => {
    res.send('Wrike translation bot service is ready!');
})

app.post('/webhook', async (req, res) => {
    console.log('received webhook request');
    let data = req.body[0];
    identifyIfUsersCommentEvent(data)
        .then(() => {
            let commentType = identifyCommentType(data)
            addCommentWithJaTranslation(data, commentType)
                .catch((error) => console.debug(error))
        }).catch((error) => console.debug(error.message));

    res.status(200).end();
})

app.listen(PORT, () => {
    console.log('Listening on port:', PORT);
})
