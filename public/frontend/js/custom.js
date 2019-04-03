
$(document).ready(() => {
    $("#owl-demo").owlCarousel({
        navigation : true, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true,
        items : 1,
        autoplay:true,
        autoplayTimeout:3000,
        autoplayHoverPause:true,
        loop:true,


    });
    $("#testimonal").owlCarousel({
        navigation : true, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true,
        items : 1,
        autoplay:true,
        autoplayTimeout:3000,
        autoplayHoverPause:true,
        loop: true,

    });
    $('#searchBox').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            let value = $(this).val()
            if(value !== '') {
                $.ajax({
                    method: "post",
                    url: "/tim-kiem",
                    data: JSON.stringify({keyword: value}),
                    contentType:"application/json; charset=utf-8",
                }).done(function( msg ) {
                    msg = JSON.parse(msg)
                    if (msg.success) {
                        window.location.href = '/tim-kiem';
                    }
                });
            } else {
                Swal(
                    'Nhập từ khoá cần tìm kiếm!',
                    'Click to continue!',
                    'warning',
                )
            }
        }

    });
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    var url = window.location;
    if(url.href.indexOf('tai-lieu') > 0) {
        $('.navbar .tai-lieu').addClass('active');
    } else if(url.href.indexOf('the-loai') > 0) {
        $('.navbar li.dropdown').addClass('active');
    } else {
        var element = $('ul.navbar-nav a').filter(function() {
            return this.href == url ;
        }).parent().addClass('active');
    }


    //Load Morre
    const buttonLoadmore = $("#loadMoreHomePage");
    buttonLoadmore.click(() => {
        $('#loading-image').show();
        const parentAppend = $('.recent-book-sec .loadmore');
        const currentLength = parentAppend.children().length - 1;
        const folderUpload = 'uploads/articles/';
        parentAppend.parent().parent().addClass('opa-loading');
        if(currentLength > 0) {
            $.ajax({
                url: '/loadmore-books',
                type: 'post',
                data: JSON.stringify({currentLength: currentLength}),
                contentType:"application/json; charset=utf-8",
                success: function (data) {
                    data = JSON.parse(data)
                    data.forEach(async(item) => {
                        let xhtml = `<div class="col-lg-2 col-md-3 col-sm-4">
                                <div class="item" data-toggle="tooltip" data-placement="right" title="Click để đọc thử !">
                                    <a href="/xem-sach/${item.slug}/${item._id}"><img height="232px" src="${folderUpload}/${item.thumb}" alt="<%=item.name%>"></a>
                                    <h3><a href="/xem-sach/${item.slug}/${item._id}">${item.name}</a></h3>
                                    <h6><span class="price">
                                        ${(item.coverprice + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + `₫`}
                                    </span> / <a href="https://www.facebook.com/ngankieu0905">Đặt Sách</a></h6>`
                        if(item.price < item.coverprice) {
                            xhtml +=  `<span class="sale">-${100 - Math.floor(item.price *100 / item.coverprice)}%</span>`
                        }
                        xhtml += '</div></div>'

                        $(xhtml).appendTo(parentAppend).slideDown()
                    })
                    parentAppend.append(buttonLoadmore.parent());
                }
            }).done(() => {
                $('#loading-image').hide();
                parentAppend.parent().parent().removeClass('opa-loading');
            });
        }
    })
    //change Sort
    $('select[name="change_sort_field"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/sort_field/' + path[2] + '/' + path[3] + '/' + $(this).val();
        window.location.pathname = link;
    })
    $('select[name="change_sort_type"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/sort_type/' + path[2] + '/' + path[3] + '/' + $(this).val();
        window.location.pathname = link;
    })
    //change Sort
    $('select[name="change_sort_field_search"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/sort_field/' + $(this).val();
        window.location.pathname = link;
    })
    $('select[name="change_sort_type_search"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/sort_type/' + $(this).val();
        console.log(link);
        window.location.pathname = link;
    })
    $('select[name="change_show_entries"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/entries/' + path[2] + '/' + path[3] + '/' + $(this).val();
        window.location.pathname = link;
    })
    //Go top
    $(document).scroll(function (e) {
        let top = $(this).scrollTop();
        if (parseInt(top) >= 350) {
            $('.go-top').animate( {"left": "60px"}, 100, "linear" );
        }
        if (parseInt(top) < 300) {
            $('.go-top').animate( {"left": "-60px"}, 100, "linear" );
        }
    });
    $('.go-top').click(function () {
        $("html, body").animate({ scrollTop: 0 }, 1000);
    })




})




