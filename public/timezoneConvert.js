var dateList = document.getElementsByClassName("date");
    for (var i = 0; i <dateList.length; i++){
      var localDate = new Date(dateList[i].textContent);
      dateList[i].textContent = "Date Searched: " + localDate.toLocaleString();
    }
