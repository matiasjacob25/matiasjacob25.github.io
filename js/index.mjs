import { getImages, addImage, deleteImage, addComment, deleteComment, getNextImage, getPrevImage } from "./api.mjs";

// updates DOM and displays the next (up to) 10 comments 
// following the last child comment in modal-comments
function displayNextPage(image_id) {
    const earliest_comment_id = document.getElementById("modal-comments").lastChild.id;
    
    // get comments
    const images = getImages();
    let comments = [];
    for (let i = 0 ; i < images.length; i++){
        if (images[i].image_id === image_id) {
            comments = images[i].comments_data.comments;
            break;
        }
    }

    // if the page has < 10 comments or 
    // the 10th comment was the most recently added comment, then do nothing
    if (document.querySelectorAll(".comment").length < 10 ||
        earliest_comment_id == comments[0].comment_id) { return; }


    // remove displayed comments
    document.getElementById("modal-comments").innerHTML = "";

    // track comments to display
    let comments_to_display = [];
    for (let i = comments.length -1; i >= 0; i--) {
        if (comments[i].comment_id < earliest_comment_id) {
            comments_to_display.push(comments[i]);
        }
        if (comments_to_display.length === 10) {break;}
    }

    // create new comments in DOM to render
    comments_to_display.forEach( comment => {
        const comment_elem = document.createElement("div");
        comment_elem.className = "comment"; 
        comment_elem.id = comment.comment_id;
        comment_elem.innerHTML = `
            <div class="comment-user-info">
                <p class="comment-author">${comment.comment_author}</p>
                <p class="date-info">${comment.creation_date}</p>
            </div>
            <div class="comment-content"> ${comment.comment_content} </div>
            <div class="comment-delete-icon icon"></div>
        `
        //handler for comment delete button
        comment_elem.querySelector(".comment-delete-icon.icon").onclick = () => {
            deleteComment(comment.comment_id, image_id);
            updateModalComments(image_id);
        }

        //insert comment as last child
        document.getElementById("modal-comments").appendChild(comment_elem);
    })
}


// updates DOM and displays the prev 10 comments before the first child comment in modal-comments
function displayPrevPage(image_id) {
    const latest_comment_id = document.getElementById("modal-comments").firstChild.id;
    // get comments
    const images = getImages();
    let comments = [];
    for (let i = 0 ; i < images.length; i++){
        if (images[i].image_id === image_id) {
            comments = images[i].comments_data.comments;
            break;
        }
    }
    
    // if there are no comments OR 
    // if the latest_comment_id (first child element of modal-comments) is
    // the first comment in comments, then assume no comments precede it and do nothing
    if (!comments || latest_comment_id == comments[comments.length-1].comment_id) { return; }


    // remove displayed comments
    document.getElementById("modal-comments").innerHTML = "";

    // track comments to display
    let comments_to_display = [];
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].comment_id > latest_comment_id) {
            comments_to_display.push(comments[i]);
        }
        if (comments_to_display.length === 10) {break;}
    }


    // create new comments in DOM to render
    comments_to_display.forEach( comment => {
        const comment_elem = document.createElement("div");
        comment_elem.className = "comment"; 
        comment_elem.id = comment.comment_id;
        comment_elem.innerHTML = `
            <div class="comment-user-info">
                <p class="comment-author">${comment.comment_author}</p>
                <p class="date-info">${comment.creation_date}</p>
            </div>
            <div class="comment-content"> ${comment.comment_content} </div>
            <div class="comment-delete-icon icon"></div>
        `
        //handler for comment delete button
        comment_elem.querySelector(".comment-delete-icon.icon").onclick = () => {
            deleteComment(comment.comment_id, image_id);
            updateModalComments(image_id);
        }

        //insert comment as first child
        document.getElementById("modal-comments").prepend(comment_elem);
    })
}



// renders the comment page (10 comments) that the most recently added comment falls under
function updateModalComments (image_id){
    //remove previous comments if they exist
    if (document.getElementById("modal-comments")) {
        document.getElementById("modal-comments").remove();
    }

    // get comments
    const images = getImages();
    let comments = [];
    for (let i = 0 ; i < images.length; i++){
        if (images[i].image_id === image_id) {
            comments = images[i].comments_data.comments;
            break;
        }
    }

    // track which comments to display (10 at a time) from newest to oldest
    let comments_to_display = [];
    for (let i = comments.length - 1; i >= 0; i--) {
        // stop creating comments if 10 comments are already added or no more comments exists
        if (comments_to_display.length === 10 || i < 0) { break; }

        // LIFO ordering of comments
        comments_to_display.push(comments[i]);
    }

    comments_to_display.forEach( comment => {
        const comment_elem = document.createElement("div");
        comment_elem.className = "comment"; 
        comment_elem.id = comment.comment_id;
        comment_elem.innerHTML = `
            <div class="comment-user-info">
                <p class="comment-author">${comment.comment_author}</p>
                <p class="date-info">${comment.creation_date}</p>
            </div>
            <div class="comment-content"> ${comment.comment_content} </div>
            <div class="comment-delete-icon icon"></div>
        `
        //handler for comment delete button
        comment_elem.querySelector(".comment-delete-icon.icon").onclick = () => {
            deleteComment(comment.comment_id, image_id);
            updateModalComments(image_id);
        }

        //insert comment as last child in modal-comments 
        
        //if first comment is being added, create the modal comment object
        if (!document.getElementById("modal-comments")){
            const modal_comments = document.createElement("div");
            modal_comments.id = "modal-comments";
            
            //insert as first child of modal-comments-wrapper
            document.getElementById("modal-comments-wrapper").prepend(modal_comments);
        }
        document.getElementById("modal-comments").appendChild(comment_elem);
    })
}


//handler for comment button (modal-popup)
function setupCommentHandler (image) {
    //remove modal container if it exists
    if (document.getElementById("modal-container")) { document.getElementById("modal-container").remove(); }

    //create modal container
    const modal_container = document.createElement("div");
    modal_container.id = "modal-container";
    modal_container.innerHTML = `
    <div id="modal-display">
        <img src=${image.image_url} id="modal-image-display"></img>
        <div id="modal-comment-content">
            <div id="back-button-wrapper">
                <button id="back-button">back</button>
            </div>
            <form id="modal-comment-form">
                <div class="modal-form-field">
                    <h3 class="modal-form-field-header form-field-header" >Name:</h3>
                    <input
                    type="text"
                    id="comment_name"
                    class="form-element"
                    placeholder="Enter your name"
                    name="user_comment"
                    required
                    />
                </div>
                <div class="modal-form-field">
                    <h3 class="modal-form-field-header form-field-header" >Content:</h3>
                    <textarea
                    rows="5"
                    id="comment_form_content"
                    class="form_element"
                    name="user_message"
                    placeholder="Enter your comment here..."
                    required
                    ></textarea>
                </div>
                <button type="submit" class="form-button">Post your comment</button>
            </form>
            <div id="modal-comments-wrapper">
                <div id="modal-comments"></div>
                <div id="modal-comments-footer">
                    <button id="modal-comments-previous">prev</button>
                    <button id="modal-comments-next">next</button>
                </div>
            </div>
        </div>
    </div>
    `

    // insert modal_container before footer in DOM
    document.getElementsByTagName("footer")[0].insertAdjacentElement("beforebegin", modal_container); 

    //handler for modal's back button
    document.getElementById("back-button").onclick = () => {
        document.getElementById("modal-container").remove();
    };
    //handler for modal's previous button
    document.getElementById("modal-comments-previous").onclick = () => {displayPrevPage(image.image_id); }
    //handler for modal's next button
    document.getElementById("modal-comments-next").onclick = () => {displayNextPage(image.image_id); }
    //handler for modal's comment post button
    modal_container
        .querySelector("#modal-comment-form")
        .addEventListener("submit", (e) => {
            //prevent from refreshing page on submit
            e.preventDefault();

            // read form elements
            const comment_name = document.getElementById("comment_name").value;
            const comment_content = document.getElementById("comment_form_content").value;

            // clean form
            document.getElementById("modal-comment-form").reset();

            // add comment info to storage
            addComment(image.image_id, comment_name, comment_content);
            
            //re-configure next & prev handlers
            // const images = getImages();
            // images.filter(image => image.image_id === image.image_id);
            // document.getElementById("modal-comments-previous").onclick = () => { displayPrevPage(images[0]); }
            // document.getElementById("modal-comments-next").onclick = () => {displayNextPage(images[0]); }

            updateModalComments(image.image_id);        
        })


    // render existing comments, on load
    updateModalComments(image.image_id);
}


//toggle the visibility of the element with id element_id
function toggleVisibility(element_id) {
    const elem = document.getElementById(element_id);
    const visibility = window.getComputedStyle(elem).visibility;
    if (visibility === "hidden") {
        elem.style.visibility = "visible";
        elem.style.height = "auto";
    } else {
        elem.style.visibility = "hidden";
        elem.style.height = "0px";
    }
}


// setup event handlers & re-render main page for new image with id image_id 
function updateMain(image_id){

    //remove previous image slider if it exists
    if (document.getElementById("image-slider")) {
        document.getElementById("image-slider").remove();
    }

    // Last-in First-out display of images
    const images = getImages();

    // // only change image if there are images in storage
    // if (images.length > 0) {
        
    // extract image data from images
    let image = {};
    for (let i = 0; i < images.length; i++) {
        if (images[i].image_id === image_id) {
            image = images[i];
            break;
        }
    }

    //update image display
    const image_slider = document.createElement("div");
    image_slider.id = "image-slider";
    image_slider.innerHTML = 
    `
        <div id="previous-icon" class="icon"></div>
        <div id="image-info-container">
            <h3 id="image-display-title">
                ${image.image_title}
            </h3>
            <img src=${image.image_url} id="image-display"></img>
            <div class="image-display-footer">
                <div id="image-footer-container">
                    <h3 id="image-display-author"> By ${image.image_author}</h3>
                    <p class="date-info">${image.creation_date}</p>
                </div>
                <div id="image-footer-buttons">
                    <button id="comment-button">comment</button>
                    <div class="delete-icon icon"></div>
                </div>
            </div>
        </div>
        <div id="next-icon" class="icon"></div>
    `

    // handler for delete button
    image_slider.querySelector(".delete-icon.icon").onclick = () => {
        const next_image_id = getNextImage(image.image_id).image_id;
        const prev_image_id = getPrevImage(image.image_id).image_id;
        if (next_image_id !== image.image_id) {
            updateMain(next_image_id);
        }
        else if (prev_image_id !== image.image_id) {
            updateMain(prev_image_id);
        }
        else {
            // remove image slider if there is only one image left
            document.getElementById("image-slider").remove();
        }
        deleteImage(image.image_id);
    }
    // handler for next image button
    image_slider.querySelector("#next-icon").onclick = () => { 
        const next_image_id = getNextImage(image.image_id).image_id; 
        updateMain(next_image_id);
    }
    // handler for previous image button
    image_slider.querySelector("#previous-icon").onclick = () => {
        const prev_image_id = getPrevImage(image.image_id).image_id; 
        updateMain(prev_image_id);        
    }
    // handler for comment button
    image_slider.querySelector("#comment-button").onclick = () => {
        setupCommentHandler(image);
    }

    // add the image-slider to the document
    document.getElementsByTagName("footer")[0].insertAdjacentElement("beforebegin", image_slider); 
}


//handler for collapsible button
document.getElementById("collapsible-button").onclick = () => { 
    toggleVisibility("add-image-form") 

    // update collapsible-icon and form visbibility on-click
    const elem = document.getElementById("collapsible-icon");
    const img_path = window.getComputedStyle(elem).backgroundImage;
    if (img_path.includes("/media/collapse-down.png")) {
        elem.style.backgroundImage = "url(media/collapse-up.png)";
    } else {
        elem.style.backgroundImage = "url(media/collapse-down.png)";
    }
};

document
    .getElementById("add-image-form")
    .addEventListener("submit", function (e) {
        //prevent from refreshing page on submit
        e.preventDefault();
        
        // read form elements
        const image_author = document.getElementById("image_author").value;
        const image_title = document.getElementById("image_title").value;
        const image_url = document.getElementById("image_url").value;

        // clean form
        document.getElementById("add-image-form").reset();

        // add image info to storage
        const new_image_id = addImage(image_title, image_author, image_url);
        updateMain(new_image_id);
    })

// on page load, render the most recently added image if it exists
const images = getImages();
if (images.length > 0) {
    const recently_added_image = images[images.length - 1];
    updateMain(recently_added_image.image_id);
}

//start off with modal removed
// document.getElementById("modal-container").remove();
