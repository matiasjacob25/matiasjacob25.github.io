/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

// get and return all images from storage
export function getImages() {
    // check if images_data exists in local storage
    if (!localStorage.getItem("images_data")) {
        localStorage.setItem("images_data", JSON.stringify({ image_id: 0, images: [] }));
    }

    return JSON.parse(localStorage.getItem("images_data")).images;
}


// add an image to the gallery and return the imageId
export function addImage(title, author, url) {
    // check if images_data exists in local storage
    if (!localStorage.getItem("images_data")) {
        localStorage.setItem("images_data", JSON.stringify({ image_id: 0, images: [] }));
    }

    let images_data = JSON.parse(localStorage.getItem("images_data"));
    const new_image = {
        image_id: images_data.image_id++,
        image_author: author,
        image_title: title,
        image_url: url,
        creation_date: new Date(),
        comments_data: {comment_id: 0, comments: []}
    }
    images_data.images.push(new_image);
    localStorage.setItem("images_data", JSON.stringify(images_data));

    return new_image.image_id;
}


// delete an image from the gallery given its imageId
export function deleteImage(imageId) {
    //update images in storage
    let images_data = JSON.parse(localStorage.getItem("images_data"));
    images_data.images = images_data.images.filter(image => image.image_id !== imageId);
    
    //update comments in storage
    localStorage.setItem("images_data", JSON.stringify(images_data));
}


// add a comment to an image
export function addComment(imageId, author, content) {
    let images_data = JSON.parse(localStorage.getItem("images_data"));

    // create new comment for image with id imageId
    for (let image_index = 0; image_index < images_data.images.length; image_index++){
        if (images_data.images[image_index].image_id === imageId) {
            const new_comment = {
                comment_id: images_data.images[image_index].comments_data.comment_id++,
                comment_author: author,
                comment_content: content,
                creation_date: new Date()
            }
            images_data.images[image_index].comments_data.comments.push(new_comment);
            break;
        }
    }
    
    // add comment to local storage
    localStorage.setItem("images_data", JSON.stringify(images_data));
}


// delete an image comment
export function deleteComment(commentId, imageId) {
    let images_data = JSON.parse(localStorage.getItem("images_data"));

    // locate and remove comment from image with id imageId
    for (let image_index = 0; image_index < images_data.images.length; image_index++){
        if (images_data.images[image_index].image_id === imageId) {
            const new_comments = images_data.images[image_index].comments_data.comments
                                .filter(comment => comment.comment_id !== commentId);
            
            // update images_data with new comments
            images_data.images[image_index].comments_data.comments = new_comments;
            break;
        }
    }

    // update local storage with updated images_data
    localStorage.setItem("images_data", JSON.stringify(images_data));
}


// get image in gallery after image with image_id
export function getNextImage(image_id) {
    const images_data = JSON.parse(localStorage.getItem("images_data"));
    let next_image = null;

    for (let image_index = images_data.images.length - 1; image_index > 0; image_index--){
        if (images_data.images[image_index].image_id === image_id) {
            next_image = images_data.images[image_index - 1];
            return next_image;
        }
    }
    // if image_index == 0, then image should stay the same
    return images_data.images[0];
}


// get image in gallery before image with image_id
export function getPrevImage(image_id) {
    const images_data = JSON.parse(localStorage.getItem("images_data"));
    let next_image = null;

    for (let image_index = 0 ; image_index < images_data.images.length - 1; image_index++){
        if (images_data.images[image_index].image_id === image_id) {
            next_image = images_data.images[image_index + 1];
            return next_image;
        }
    }
    // if image_index == images_data.images.length - 1, then image should stay the same
    return images_data.images[images_data.images.length - 1];
}

