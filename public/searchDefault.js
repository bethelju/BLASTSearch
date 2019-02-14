var select = document.getElementsByTagName("select")[0];

select.addEventListener("input", function(){
    document.getElementsByTagName("input")[0].value = select.value;
});