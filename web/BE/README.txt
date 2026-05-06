1. Xem phần Postman để biết cụ thể các endpoints
2. Hiện tại đăng ký sẽ mở cho việc testing, sau khi đăng ký role mặc định là student (các endpoints instructor sẽ bị khóa)
    2.1 Để chỉnh role cần phải tương tác với container "db"
    2.2 Vào tab "exec" gõ "mysql -u root -p" -> Nhập mật khẩu (có trong docker-compose)

    **Lưu ý**: Các lệnh từ đây về sau phải kết thúc bằng dấu ";"
    2.3 use fs;
    2.4 show tables; (optional để xem có các tables nào trong db)   
    2.5 update users_customuser set role = "instructor" where id = ... (Chỉnh đúng id tài khoản vừa đăng ký)

3. Endpoint add-message (trong Postman) và upload-file (trong Postman) hơi chậm (thông cảm hơi gà hmu hmu sẽ cải thiện)

**Quan trọng**
4. Để sử dụng các endpoints cần lưu ý:
    4.1 Đăng nhập (hiện tại nếu chưa có tài khoản sẽ tự động đăng ký rồi đăng nhập không cần làm gì)   
    4.2 Sau khi đăng nhập kiểm tra browsers mục "Storage" chọn "Cookies", có 2 thông số quan trọng sessionid và csrftoken
        4.2.1 Muốn test các endpoints này trong postman phải lưu tương ứng 2 giá trị này trong cookies của Postman 
    4.3 Trừ các GET request, còn lại (DELETE, POST, PUT) phải kèm theo header X-CSRFToken (có demo trong Postman)

5. Nếu có thực hiện bất cứ tương tác với db và cần đồng bộ với tất cả thành viên, làm như sau:
    5.1 Vào tab "exec" của backend container
    5.2 Gõ 
        "
            python manage.py dumpdata \
                --exclude contenttypes \
                --exclude auth \
                --exclude admin \
                --exclude sessions \
                --output backup.json
        "
    5.3 Vậy là xong thay đổi này sẽ tự động map với folder BE bên ngoài và cập nhật file backup.json

6. Nếu có bị bất cứ lỗi gì khi thực hiện hoặc không rõ cứ nhắn vào group chat nhé :3. Yêu