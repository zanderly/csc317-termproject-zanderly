 let photos = async () => {
    return axios.get('https://jsonplaceholder.typicode.com/albums/2/photos');
}

function fadeOutEffect(id){
    $(`#${id}`).fadeOut("slow", function() {
            $(this).remove();
    });
    var counter = $("#container img").length;
    document.getElementById('count').innerHTML = "Remaining Photos: " + --counter;
}

 let display = async () => {
    response = await photos();
    document.getElementById('count').innerHTML = "Photos Displayed: " + response.data.length;
    response.data.forEach(function (image){
        var elmt = document.getElementById("container");
        var img = document.createElement("img");
        img.setAttribute("id", image.id);
        img.setAttribute("src", image.thumbnailUrl);
        img.setAttribute("title", image.title);
        img.setAttribute("onClick", "fadeOutEffect(this.id)");
        elmt.appendChild(img);
    });
}
display()
