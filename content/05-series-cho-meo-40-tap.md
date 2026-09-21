# Series "Chuyện nhà Bơ & Miu" — kế hoạch 40 tập

Kênh phim hoạt hình nhiều tập: chó Bơ và mèo Miu, từ lúc gặp nhau tới lúc cưới và nuôi con.
Chủ đề đã tạo sẵn ở [`topics/chomeo.json`](../topics/chomeo.json).

> **Khác hẳn hai kênh kia.** Showbiz và bóng đá lấy tin từ RSS rồi máy tự dựng kịch bản.
> Kênh này **không có nguồn tin nào tự chảy vào** — mỗi tập là một kịch bản viết tay.
> Dây chuyền vẫn dùng lại được y nguyên từ khâu giọng đọc trở đi, nhưng khâu "lấy tin →
> dựng kịch bản" thì bị thay bằng bàn tay người. Xem mục [Quy trình sản xuất](#quy-trình-sản-xuất).

## Vì sao làm series dài

Kênh điểm tin sống bằng **lượt xem mỗi video**. Kênh series sống bằng **người xem quay lại**,
và đó là chỉ số TikTok ưu ái nhất.

| Cơ chế | Cách khai thác trong series này |
|---|---|
| Xem hết video | Tập ngắn 55–80s, mỗi tập chốt bằng một câu bỏ lửng |
| Xem tập trước đó | Tập nào cũng nhắc "còn nhớ tập trước không" → kéo cả kho tập cũ lên |
| Theo dõi | Người xem sợ lỡ mạch chuyện, đây là lý do bấm theo dõi mạnh nhất |
| Bình luận | Mỗi tập hỏi một câu đoán trước: "Bơ nên nói gì?" |

**Ba thứ không làm:** không kéo dài lê thê chỉ để đủ 40 tập (tập nào cũng phải có một
chuyện xong trong tập đó); không để nhân vật đổi tính nết cho tiện kịch bản; không bịa
cao trào bi kịch (bệnh nan y, tai nạn) — đây là kênh ấm áp, dùng bi kịch là mất chất.

## Nhân vật — bản mô tả gốc

**Phải chép nguyên văn vào prompt mỗi lần sinh cảnh.** Model AI không nhớ tập trước;
chỉ cần đổi một chữ trong mô tả là sang tập sau con chó đã khác con chó.

| | Bơ | Miu | Bé Sữa (từ tập 34) |
|---|---|---|---|
| Loài | Chó golden retriever đực | Mèo tam thể cái | Con của hai bạn |
| Ngoại hình | Lông vàng mật, tai cụp, vòng cổ da nâu có thẻ hình xương, áo thun xanh dương bạc màu | Lông trắng đốm cam đen, mắt xanh lá, đuôi dài cong, khăn quàng cổ đỏ | Lông trắng kem, tai cụp như bố, mắt xanh như mẹ |
| Tính | Hiền, hậu đậu, chăm chỉ, hay lo, nói ít | Lanh lợi, sạch sẽ, hay dỗi, thương người nhưng không nói ra | — |
| Nghề | Giao hàng, sau làm thợ mộc | Bán cá ở chợ xóm, sau mở quán ăn nhỏ | — |
| Câu cửa miệng | "Ừ thì… để anh lo." | "Ai thèm." | — |

**Bối cảnh cố định:** xóm Mây — hẻm nhỏ Việt Nam, nhà cấp bốn mái tôn, dây điện chằng
chịt, quán cà phê vỉa hè, và **một cây bàng già ở đầu hẻm**. Cây bàng là mỏ neo của cả
series: tập 13 tỏ tình ở đó, tập 22 cầu hôn ở đó, tập 40 quay lại đó.

Bản prompt đầy đủ (tiếng Anh, để dán vào CMS) nằm ở khoá `series.prompt_bible` trong
[`topics/chomeo.json`](../topics/chomeo.json).

## Cấu trúc một tập

Khung 55–80 giây, 8 cảnh. Giọng đọc `vi-VN-HoaiMyNeural` ở rate `+8%` — chậm hơn hẳn
hai kênh tin, vì đây là kể chuyện chứ không phải điểm tin.

| Mốc | Phần | Thời lượng | Nội dung |
|---|---|---|---|
| 0:00 – 0:04 | Mở | 4s | Số tập + một câu nhắc mạch chuyện |
| 0:04 – 0:20 | Nhịp 1 | 16s | Đặt tình huống |
| 0:20 – 0:45 | Nhịp 2 | 25s | Đẩy căng thẳng lên |
| 0:45 – 1:05 | Nhịp 3 | 20s | Giải quyết — phần ấm lòng |
| 1:05 – 1:15 | Chốt | 10s | Câu bỏ lửng + kêu gọi theo dõi |

Mỗi nhịp là 2 cảnh, mỗi cảnh một clip AI 8 giây. Tổng 7 clip cho một tập.

## 40 tập

### Phần 1 · Gặp gỡ (tập 1–8)

**1 — Ngày Bơ dọn về xóm Mây**
Hook: "Ngày đầu tiên ở xóm mới, Bơ làm đổ nguyên thùng cá của người ta."
Nhịp: Bơ kéo xe đồ vào hẻm → vấp dây điện, thùng cá đổ tung → Miu đứng nhìn, không nói một tiếng, quay lưng đi.
Chốt: "Ấn tượng đầu tiên coi như xong. Mà xóm này có mỗi một con hẻm thôi."

**2 — Con mèo hay giận**
Hook: "Bơ mua cá đền, ba lần bấm chuông, ba lần cửa đóng."
Nhịp: Bơ tập câu xin lỗi trước gương → bấm chuông, Miu không mở → Bơ để túi cá trước cửa rồi về.
Chốt: "Sáng hôm sau, túi cá không còn ở đó nữa."

**3 — Cơn mưa đầu tiên**
Hook: "Mưa xóm Mây đổ cái ào, không báo trước bao giờ."
Nhịp: Miu ôm rổ cá chạy mưa → Bơ chạy theo, đưa áo mưa của mình → Bơ ướt sũng đứng cười.
Chốt: "Miu nói 'cảm ơn'. Hai chữ thôi, mà Bơ vui nguyên tuần."

**4 — Nồi cháo cháy**
Hook: "Miu ốm. Bơ quyết định nấu cháo. Đó là một quyết định sai."
Nhịp: Bơ loay hoay trong bếp → khói bốc mù, chuông báo cháy kêu → Miu ra xem, thấy Bơ mặt lem nhem.
Chốt: "Lần đầu tiên Bơ thấy Miu cười. Đáng giá một cái nồi."

**5 — Bơ mất việc**
Hook: "Hôm đó Bơ về sớm hơn thường lệ. Không ai hỏi vì sao."
Nhịp: Bơ ngồi bệt ở bến xe, ôm cái mũ bảo hiểm → Miu đi chợ về, thấy → Miu ngồi xuống cạnh, không nói gì, mở gói xôi ra chia đôi.
Chốt: "Có những lúc người ta không cần lời khuyên. Chỉ cần có ai ngồi cạnh."

**6 — Nửa ổ bánh mì**
Hook: "Cuối tháng. Trong nhà Bơ còn đúng một ổ bánh mì."
Nhịp: Bơ đếm tiền lẻ → Miu sang mượn muối, thấy cảnh đó → hai đứa chia đôi ổ bánh, ngồi bậc thềm.
Chốt: "Nghèo thì nghèo, mà bữa đó ăn ngon nhất xóm."

**7 — Cả xóm đồn**
Hook: "Bà Bảy bán tạp hoá hỏi một câu, cả hẻm nghe thấy."
Nhịp: Bà Bảy: "Hai đứa bây yêu nhau hả?" → Bơ chối, Miu chối, cả hai đỏ mặt → hai đứa đi hai hướng khác nhau rồi cùng quay lại nhìn.
Chốt: "Chối thì dễ. Khó là cái lúc quay đầu nhìn lại."

**8 — Đêm pháo hoa**
Hook: "Bơ tập nói câu đó suốt một tuần. Rồi pháo hoa nổ."
Nhịp: Hai đứa lên sân thượng coi pháo hoa → Bơ quay sang nói "Anh thích em" → tiếng pháo át đi, Miu hỏi "Hả? Anh nói gì?"
Chốt: "Bơ lắc đầu: 'Không có gì.' Tập sau: Bơ có nói lại được không?"

### Phần 2 · Yêu nhau (tập 9–16)

**9 — Lời chưa nói**
Hook: "Nói trước gương thì trôi chảy. Đứng trước Miu thì quên sạch."
Nhịp: Bơ tập tỏ tình với cái gối → tập với con chó hàng xóm → gặp Miu thật thì chỉ nói được "Ừ… ăn cơm chưa?"
Chốt: "Ba mươi tuổi đầu rồi mà còn sợ một câu bốn chữ."

**10 — Anh mèo Xiêm**
Hook: "Hôm đó có một chiếc xe hơi đậu ngay đầu hẻm."
Nhịp: Mèo Xiêm sang trọng tới chợ tìm Miu → mời Miu đi ăn nhà hàng → Bơ đứng bên kia đường, tay còn cầm hộp cơm hộp.
Chốt: "Bơ nhìn xuống cái hộp cơm trong tay. Rồi đi về."

**11 — Bơ lùi lại**
Hook: "Bơ bắt đầu tránh mặt. Vòng đường xa hơn ba trăm mét để khỏi đi ngang nhà Miu."
Nhịp: Bơ đi đường vòng → Miu đợi ở hàng rào, không thấy → Bơ tự nói: "Người ta xứng đáng hơn."
Chốt: "Cái tội lớn nhất của người hiền là tự quyết định thay người khác."

**12 — Miu đi tìm**
Hook: "Miu đi hết xóm Mây trong mưa để tìm một con chó."
Nhịp: Miu hỏi bà Bảy, hỏi quán cà phê → tìm thấy Bơ ngồi dưới gốc bàng → Miu tát yêu một cái: "Ai cho anh tự bỏ cuộc?"
Chốt: "Bơ ngẩng lên. Lần này không có pháo hoa nào để đổ lỗi."

**13 — Gốc bàng**
Hook: "Câu nói một tuần không ra được, giờ ra trong ba giây."
Nhịp: Bơ đứng dậy, ướt nhẹp → "Anh thích em. Lâu rồi." → Miu quay mặt đi, nói nhỏ: "Biết rồi. Lâu rồi."
Chốt: "Cây bàng đầu hẻm hôm đó có thêm một vết khắc."

**14 — Buổi hẹn đầu tiên**
Hook: "Bơ dành dụm một tháng cho buổi hẹn này."
Nhịp: Bơ dẫn Miu tới quán sang, đọc thực đơn rồi tái mặt → hai đứa lẳng lặng đi ra → ngồi ăn ốc vỉa hè, cười muốn sặc.
Chốt: "Miu nói: 'Lần sau khỏi cố. Em thích chỗ này hơn.'"

**15 — Cãi nhau lần đầu**
Hook: "Bơ quên sinh nhật Miu. Chỉ có vậy thôi."
Nhịp: Miu nấu sẵn hai phần cơm, ngồi đợi → Bơ về trễ, tay không → Miu không la, chỉ dọn một phần cơm đi.
Chốt: "Ba ngày không ai nói với ai. Im lặng nặng hơn cãi nhau nhiều."

**16 — Đứng dưới cửa sổ**
Hook: "Bơ đứng dưới cửa sổ nhà Miu từ mười giờ tối tới sáng."
Nhịp: Bơ đứng im, trời đổ sương → hàng xóm thò đầu ra coi → sáng ra, Miu mở cửa sổ, ném xuống một cái khăn.
Chốt: "'Vô nhà đi, lạnh chết bây giờ.' Đó là cách Miu nói 'em tha thứ'."

### Phần 3 · Cầu hôn & đám cưới (tập 17–24)

**17 — Ba công việc một lúc**
Hook: "Bơ muốn mua một chiếc nhẫn. Bơ nhận thêm hai việc."
Nhịp: Sáng giao hàng, chiều phụ hồ, tối rửa chén → Bơ ngủ gục trên xe → Miu thấy vết chai trên tay Bơ, không hỏi.
Chốt: "Miu đếm lại tiền dành dụm của mình. Rồi cất đi, không nói."

**18 — Ra mắt**
Hook: "Mẹ Miu nói một câu ngay ở cửa: 'Nhà này chưa bao giờ nuôi chó.'"
Nhịp: Bơ mang giỏ trái cây tới → mẹ Miu nhìn từ đầu tới chân → không mời ngồi.
Chốt: "Bơ vẫn cười. Bơ đứng suốt buổi đó."

**19 — Cái bát vỡ**
Hook: "Bữa cơm ra mắt lần hai. Bơ làm vỡ cái bát gia truyền."
Nhịp: Bơ cố giành phần rửa chén → tuột tay, bát rơi → cả nhà im phăng phắc, mẹ Miu đứng dậy đi vào phòng.
Chốt: "Miu nắm tay Bơ dưới gầm bàn. Chỉ vậy thôi."

**20 — Đêm mẹ Miu ngã**
Hook: "Hai giờ sáng, nhà Miu có tiếng động."
Nhịp: Mẹ Miu trượt chân ở bậc thềm → Bơ nghe tiếng, chạy sang cõng bà đi bệnh viện → Bơ ngồi ngoài hành lang tới sáng.
Chốt: "Bà tỉnh dậy, thấy đôi dép của Bơ ở cửa phòng. Chỉ một chiếc — chiếc kia rơi dọc đường."

**21 — Chiếc nhẫn cũ**
Hook: "Mẹ Miu gọi Bơ vô phòng. Lần đầu tiên."
Nhịp: Bà mở hộp gỗ cũ → lấy ra chiếc nhẫn của chính bà ngày trước → "Nhà này giờ nuôi chó rồi đó."
Chốt: "Bơ khóc. Bơ nói là tại bụi."

**22 — Cầu hôn**
Hook: "Vẫn cây bàng đó. Vẫn hai đứa đó. Khác mỗi cái hộp nhỏ trong túi."
Nhịp: Bơ dẫn Miu ra gốc bàng, chỉ vết khắc năm xưa → quỳ xuống, tay run → Miu chưa kịp trả lời thì cả xóm nấp sau gốc cây reo lên.
Chốt: "Miu gật đầu. Bà Bảy khóc to hơn cả cô dâu."

**23 — Cả xóm làm đám cưới**
Hook: "Không đủ tiền thuê nhà hàng. Nên cả xóm xắn tay vô."
Nhịp: Bà Bảy lo bàn ghế, quán cà phê lo nhạc → Bơ đi thử vest, ống quần dài lê thê → đêm trước cưới, rạp bị gió thổi sập.
Chốt: "Bốn giờ sáng, cả xóm ra dựng lại. Không ai than một tiếng."

**24 — Ngày cưới**
Hook: "Đúng ngày cưới thì trời mưa. Dĩ nhiên rồi."
Nhịp: Mưa xối xả, khách chạy tán loạn → cả xóm giương ô làm thành một đường hầm từ đầu hẻm tới rạp → Miu bước qua đường hầm ô đó.
Chốt: "Bơ đứng cuối đường hầm. Đợi tám tập rồi, giờ mới tới lượt."

### Phần 4 · Vợ chồng son (tập 25–32)

**25 — Đêm tân hôn dọn nhà**
Hook: "Đêm tân hôn của Bơ và Miu trôi qua trong… bụi."
Nhịp: Căn trọ chín mét vuông, đồ chất đầy → hai đứa dọn tới nửa đêm → ngủ gục trên đống thùng các-tông.
Chốt: "Nhà bé xíu. Mà lần đầu tiên có chữ 'nhà mình'."

**26 — Sạch và bừa**
Hook: "Miu xếp dép thẳng hàng. Bơ thì… có dép là tốt rồi."
Nhịp: Miu lau nhà ba lần một ngày → Bơ để tất trên bàn ăn → trận cãi nhau về cái khăn lau.
Chốt: "Sống chung không khó vì chuyện lớn. Khó vì cái khăn lau."

**27 — Hoá đơn tháng đầu**
Hook: "Tờ hoá đơn tiền điện đầu tiên dán lên tủ lạnh như một lời cảnh cáo."
Nhịp: Hai đứa ngồi tính từng khoản → Bơ đề nghị bỏ tiền cà phê sáng → Miu bỏ tiền son.
Chốt: "Cả hai giấu nhau, cả hai đều bỏ. Tháng đó dư được hai trăm ngàn."

**28 — Cái tủ lạnh cũ**
Hook: "Bơ được lên thợ chính. Lương thêm một triệu hai."
Nhịp: Bơ chạy về khoe → hai đứa đi mua tủ lạnh cũ ở tiệm ve chai → khiêng lên lầu ba, thở không ra hơi.
Chốt: "Tối đó hai đứa mở tủ lạnh ra ngắm. Trong tủ có đúng hai quả trứng."

**29 — Hai vạch**
Hook: "Miu đứng trong nhà tắm lâu hơn bình thường."
Nhịp: Miu cầm que thử, tay run → mở cửa ra, đưa cho Bơ → Bơ nhìn, rồi ngồi bệt xuống sàn.
Chốt: "Bơ không nói được câu nào. Bơ chỉ ôm cái đầu gối của Miu."

**30 — Hai giờ sáng**
Hook: "Miu thèm bánh tráng trộn. Lúc hai giờ sáng."
Nhịp: Bơ đạp xe khắp xóm, quán nào cũng đóng → Bơ tự mua nguyên liệu về trộn → làm dở tệ, Miu vẫn ăn hết.
Chốt: "Bơ hỏi ngon không. Miu nói dở. Rồi xin thêm phần nữa."

**31 — Nhịp tim**
Hook: "Lần đầu tiên hai đứa nghe được tiếng của một người thứ ba."
Nhịp: Phòng siêu âm, máy chạy → tiếng tim đập vang lên → Bơ nín thở, Miu bụm miệng.
Chốt: "Ra khỏi phòng khám, hai đứa đi bộ về. Không ai nói gì suốt đường."

**32 — Cái cũi**
Hook: "Bơ quyết định tự đóng cũi cho con. Bơ là thợ mộc mà."
Nhịp: Bản vẽ nguệch ngoạc → hỏng lần một, lần hai, lần ba → lần thứ năm thì đứng được.
Chốt: "Cũi hơi xiêu. Mà Bơ đánh bóng cái xiêu đó tới sáng."

### Phần 5 · Làm cha mẹ (tập 33–40)

**33 — Nửa đêm**
Hook: "Miu lay Bơ dậy lúc ba giờ sáng. 'Anh ơi, chắc là tới rồi.'"
Nhịp: Bơ bật dậy, chạy vòng quanh phòng → quên cả mặc áo, quên luôn túi đồ đã chuẩn bị → cả xóm bật đèn, xe ôm bà Bảy chở đi.
Chốt: "Bơ tới bệnh viện mới phát hiện mình đi có một chiếc dép. Lại nữa."

**34 — Bé Sữa**
Hook: "Sáu giờ mười bảy phút sáng."
Nhịp: Tiếng khóc đầu tiên → y tá bế ra, một sinh linh nhỏ tai cụp mắt xanh → Bơ đưa tay ra rồi rụt lại, sợ làm đau.
Chốt: "Miu đặt tên là Sữa. Bơ đồng ý trước khi nghe hết câu."

**35 — Đêm đầu tiên**
Hook: "Đêm đầu tiên làm cha mẹ. Không ai ngủ được một phút."
Nhịp: Sữa khóc, Bơ bế đi vòng quanh phòng → Miu pha sữa, đổ hai lần → bốn giờ sáng, Sữa ngủ, hai đứa nhìn nhau cười ngơ ngác.
Chốt: "Mệt muốn chết. Mà không ai muốn đi ngủ, sợ lỡ mất."

**36 — Quầng thâm**
Hook: "Bơ đi làm với hai quầng thâm to bằng cái chén."
Nhịp: Bơ ngủ gật ở xưởng → thợ cùng xưởng trêu → Bơ mở điện thoại khoe ảnh con, cười toe.
Chốt: "Ai làm cha rồi cũng vậy: mệt thì mệt, khoe thì vẫn phải khoe."

**37 — Tiếng đầu tiên**
Hook: "Sữa gọi 'ba' trước. Miu dỗi ba ngày."
Nhịp: Sữa bập bẹ "ba ba" → Bơ mừng quýnh, gọi điện cho cả xóm → Miu ngồi một góc, mặt xị.
Chốt: "Tối đó Sữa gọi 'mẹ'. Miu khóc còn to hơn lúc Bơ cầu hôn."

**38 — Đêm bệnh viện**
Hook: "Sữa sốt bốn mươi độ. Hai giờ sáng, lại là hai giờ sáng."
Nhịp: Hai đứa thay nhau chườm khăn → hành lang bệnh viện, Miu ngồi dựa vai Bơ → Bơ nắm tay Miu, không nói gì.
Chốt: "Sáng ra Sữa hạ sốt. Bơ mới dám thở."

**39 — Sinh nhật một tuổi**
Hook: "Cả xóm Mây lại kéo tới. Lần này là mừng thôi nôi."
Nhịp: Bà Bảy làm bánh, quán cà phê cho mượn loa → Sữa bốc trúng cây bút → cả xóm hò reo.
Chốt: "Mẹ Miu ngồi góc nhà, nhìn Bơ, gật đầu một cái. Vậy là đủ."

**40 — Trở lại gốc bàng**
Hook: "Một buổi chiều, ba người ra đầu hẻm."
Nhịp: Bơ chỉ cho Sữa vết khắc trên thân cây → Miu tựa vai Bơ → Bơ hỏi: "Nếu được chọn lại, em còn chọn anh không?"
Chốt: "Miu không trả lời. Miu chỉ nắm chặt tay Bơ hơn. — Hết phần một. Phần hai: ngày Sữa đi học."

## Nhịp đăng & caption

| | |
|---|---|
| Tần suất | 1 tập/ngày, 20:30 — khung giờ gia đình quây quần |
| Thứ tự caption | `Tập 7/40 · [Tên tập]` — số tập luôn đứng đầu |
| Câu cuối caption | Một câu hỏi đoán trước: "Theo bạn Bơ nên làm gì?" |
| Bình luận ghim | Link tập trước, ghim ngay khi đăng |
| Cuối mỗi phần (tập 8, 16, 24, 32) | Đăng thêm một bản tổng hợp 3 phút của cả phần |

Hashtag lấy sẵn trong `topics/chomeo.json`. Giữ nguyên bộ này suốt 40 tập — đổi hashtag
giữa chừng làm loãng tín hiệu series.

## Quy trình sản xuất

Kênh này **không chạy được bằng `make video TOPIC=chomeo`** — lệnh đó sẽ đi lấy RSS và
không tìm thấy gì. Mỗi tập phải có kịch bản viết tay:

```bash
# 1. Viết kịch bản tập, ví dụ output/chomeo/2026-09-22/script.json
# 2. Render:
.venv/bin/python -m pipeline.run_daily --topic chomeo \
    --script output/chomeo/2026-09-22/script.json
```

Cấu trúc một cảnh trong `script.json`:

| Khoá | Dùng làm gì |
|---|---|
| `kind` | `"intro"` / `"news"` / `"outro"`. **Chỉ cảnh `news` mới được sinh clip AI** |
| `headline` | Mô tả hành động cho AI vẽ, cũng là chữ hiện trên màn hình |
| `vo` | Lời kể — thứ giọng đọc phát ra |
| `index` / `total` | Hiện thành badge `CẢNH 3/8` (nhãn lấy từ `captions.chip_label`) |
| `source` | **Để rỗng** — có giá trị thì màn hình hiện "Nguồn: …", vô duyên với phim |

Prompt sinh cảnh nằm ở CMS → Kênh → ô prompt. Dán nguyên văn `series.prompt_bible`
trong `topics/chomeo.json`; phần `{tieu_de}` cuối prompt sẽ được thay bằng `headline`
của từng cảnh.

## Hai rủi ro phải biết trước

**1. Nhân vật sẽ bị trôi hình.** Veo và Kling sinh từng clip độc lập, không nhớ clip
trước. Cùng một prompt, tập 12 ra con chó khác tập 3 là chuyện bình thường. Cách giảm:
mô tả nhân vật cực chi tiết và **chép y nguyên từng chữ**, không bao giờ diễn đạt lại.
Cách giải quyết triệt để là image-to-video với một ảnh nhân vật cố định — `pipeline/aiclip.py`
hiện chỉ gọi endpoint text2video, nên muốn vậy phải sửa code thêm.

**2. Chi phí thật sự đáng kể.** 7 clip × 8 giây = 56 giây sinh ra mỗi tập:

| Engine | Giá | Một tập | 40 tập |
|---|---|---|---|
| Veo 3.1 Standard | 0,40 USD/giây | ~22 USD | **~900 USD** |
| Veo 3.1 Fast | rẻ hơn, xem bảng giá trong CMS | | |
| Kling std | rẻ hơn Veo nhiều lần | | |

Luôn xem phần ước tính chi phí trong CMS trước khi bật. Gợi ý: làm 3 tập đầu bằng Kling
để chốt tạo hình nhân vật, chỉ nâng lên Veo nếu nhân vật đã ổn định.
