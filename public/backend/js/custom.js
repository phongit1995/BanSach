$(document).ready(function () {
    var ckbAll = $(".cbAll");
    var fmAdmin = $("#zt-form");
    // CKEDITOR
    if ($('textarea#content_ck').length) {
        CKEDITOR.replace('content_ck');
    }
    //check selectbox
    change_form_action("#zt-form .slbAction", "#zt-form", "#btn-action");

    //check all
    ckbAll.click(function () {
        $('input:checkbox').not(this).prop('checked', this.checked);
        if ($(this).is(':checked')) {
            $('.ordering').attr("name", "ordering");
        } else {
            $('.ordering').removeAttr("name");
        }
    });
    // hiden notify
    hiddenNotify(".close-btn");

    setTimeout(function () {
        $(".close-btn").parent().fadeOut(300);
    }, 7000);
    //click checkbox
    $("input[name=cid]").click(function () {
        if ($(this).is(':checked')) {
            $(this).parents("tr").find('.ordering').attr("name", "ordering");
        } else {
            $(this).parents("tr").find('.ordering').removeAttr("name");
        }
    });

    // CONFIRM DELETE
    $('a.btn-delete').on('click', () => {
        if (!confirm("Bạn muốn xóa không?")) return false;
    });


    function change_form_action(slb_selector, form_selector, id_btn_action) {

        var optValue;
        var isDelete = false;
        var pattenCheckDelete = new RegExp("delete", "i");

        $(slb_selector).on("change", function () {
            optValue = $(this).val();
            optValue.test
            if (optValue !== "") {
                $(id_btn_action).removeAttr('disabled');
            } else {
                $(id_btn_action).attr('disabled', 'disabled');
            }
            $(form_selector).attr("action", optValue);
        });

        $(form_selector + " .btnAction").on("click", function (e) {
            isDelete = pattenCheckDelete.test($(slb_selector).val());
            if (isDelete) {
                var confirmDelete = confirm('Are you really want to delete?');
                if (confirmDelete === false) {
                    return;
                }
            }
            var numberOfChecked = $(form_selector + ' input[name="cid"]:checked').length;
            if (numberOfChecked == 0) {
                alert("Please choose some items");
                return;
            } else {
                var flag = false;
                var str = $(slb_selector + " option:selected").attr('data-comfirm');
                if (str != undefined) {
                    flag = confirm(str);
                    if (flag == false) {
                        return flag;
                    } else {
                        $(form_selector).submit();
                    }

                } else {
                    if (optValue != undefined) {
                        $(form_selector).submit();
                    }
                }
            }

        });
    }

    // hidden parent (hidden message notify)
    function hiddenNotify(close_btn_selector) {
        $(close_btn_selector).on('click', function () {
            $(this).parent().css({ 'display': 'none' });
        })
    }
    $('select[name="group_id"]').change(function () {
        $('input[name="group_name"]').val($(this).find('option:selected').text());
    })
    $('select[name="filter_group"]').change(function () {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/' + path[2] + '/filter_group/' + $(this).val();
        window.location.pathname = link;
    })
    
    $('select[name="category_id"]').change(function () {
        $('input[name="category_name"]').val($(this).find('option:selected').text());
    })
    $('select[name="filter_category"]').change(function () {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/' + path[2] + '/filter_category/' + $(this).val();
        window.location.pathname = link;
    })
    $('select[name="dataTables-example_length"]').change(function() {
        var path = window.location.pathname.split('/');
        var link = '/' + path[1] + '/' + path[2] + '/table_length_change/' + $(this).val();
        
        window.location.pathname = link;
    })
    $('input[name="name"]').keyup(function(){
        $('input[name="slug"]').val(change_alias($(this).val()));
    })
    $('form[name="form-upload"]').submit(function(event){
        let avatar = $(this).find('input[name="avatar"]');
        $(this).find('input[name="avatar"]').remove();
        $(this).append(avatar).css({'display':'none'});
    })
    $('form[name="form-upload"]').submit(function(event){
        let thumb = $(this).find('input[name="thumb"]');
        $(this).find('input[name="thumb"]').remove();
        $(this).append(thumb).css({'display':'none'});
    })
    function change_alias(alias) {
        slug = alias.toLowerCase();
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        slug = slug.replace(/đ/gi, 'd');
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        slug = slug.replace(/ /gi, "-");
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        return slug;
    }
    $('#backHome').click(() => {
        window.location.href = '/';
    })

    let url = null;
    Dropzone.options.myAwesomeDropzone = {
        paramName: "file",
        maxFilesize: 5,
        maxFiles: 1,
        dictDefaultMessage: 'Kéo thả hình vào ô hoặc click để chọn 1 hình',
        acceptedFiles: 'image/*',
        init: function(){
            url = window.location.href;
            this.on('success', function (file, resp) {
                Swal(
                    'Thêm 1 ảnh thành công !',
                    'Click to continue!',
                    'success',
                )
                sleep(1200).then(() => {
                    window.location.href = url;
                });
            })
            this.on('thumbnail', function (file) {

                if(file.width < 10 || file.height< 10) {
                    file.rejectDimensions();
                } else {
                    file.acceptDimensions();
                }
            })
        },
        accept: function(file, done) {
            file.acceptDimensions = done;
            file.rejectDimensions = function () {
                done('Kích thước hình phải lớn hơn 100 x 100');
            }
        }
    };
    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

});


