import React, {useMemo, useState} from 'react';

type Court = {
  id: string;
  name: string;
  location: string;
  surface: string;
  indoor: boolean;
  pricePerHour: number;
  rating: number;
  amenities: string[];
  slots: string[];
};

type Booking = {
  id: number;
  courtName: string;
  date: string;
  time: string;
  duration: number;
  players: number;
  extras: string[];
  note?: string;
  totalCost: number;
};

const COURTS: Court[] = [
  {
    id: 'lake-view',
    name: 'Lake View Arena',
    location: 'Quận 2, TP.HCM',
    surface: 'Acrylic Cushion',
    indoor: true,
    pricePerHour: 420000,
    rating: 4.9,
    amenities: ['Phòng thay đồ', 'Hệ thống làm mát', 'Huấn luyện viên'],
    slots: ['06:00', '07:30', '09:00', '10:30', '14:00', '15:30', '17:00', '19:00'],
  },
  {
    id: 'sky-court',
    name: 'Sky Court Rooftop',
    location: 'Quận 1, TP.HCM',
    surface: 'Composite Cushion',
    indoor: false,
    pricePerHour: 380000,
    rating: 4.7,
    amenities: ['View panorama', 'Khu lounge', 'Hệ thống đèn LED'],
    slots: ['06:00', '07:30', '09:00', '10:30', '16:00', '17:30', '19:00', '20:30'],
  },
  {
    id: 'garden-club',
    name: 'Garden Club Courts',
    location: 'Thảo Điền, TP.HCM',
    surface: 'Hard Court',
    indoor: false,
    pricePerHour: 310000,
    rating: 4.6,
    amenities: ['Thuê vợt & bóng', 'Khu vực BBQ', 'Bãi đỗ xe riêng'],
    slots: ['06:00', '07:30', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
  },
];

const EXTRA_OPTIONS = [
  {id: 'coach', label: 'Huấn luyện viên 60 phút', price: 250000},
  {id: 'equipment', label: 'Thuê 2 bộ vợt & bóng', price: 120000},
  {id: 'water', label: 'Combo nước điện giải', price: 60000},
];

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'});

const availabilityRules: Record<string, string[]> = {
  'lake-view': ['17:00', '19:00'],
  'sky-court': ['06:00', '19:00'],
  'garden-club': ['15:00'],
};

const App: React.FC = () => {
  const [selectedCourtId, setSelectedCourtId] = useState<string>(COURTS[0].id);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('06:00');
  const [duration, setDuration] = useState<number>(90);
  const [players, setPlayers] = useState<number>(2);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['equipment']);
  const [note, setNote] = useState<string>('Muốn giữ sân có mái che nếu trời mưa.');
  const [message, setMessage] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const selectedCourt = useMemo(
    () => COURTS.find((court) => court.id === selectedCourtId) ?? COURTS[0],
    [selectedCourtId],
  );

  const availability = useMemo(() => {
    const busySlots = availabilityRules[selectedCourtId] ?? [];
    return selectedCourt.slots.map((slot) => ({
      time: slot,
      status: busySlots.includes(slot) ? 'full' : slot === '19:00' ? 'limited' : 'available',
    }));
  }, [selectedCourt, selectedCourtId]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((extra) => extra !== id) : [...prev, id],
    );
  };

  const calculateTotal = () => {
    const base = (duration / 60) * selectedCourt.pricePerHour;
    const extrasCost = selectedExtras.reduce((sum, id) => {
      const extra = EXTRA_OPTIONS.find((item) => item.id === id);
      return sum + (extra?.price ?? 0);
    }, 0);
    return base + extrasCost;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slotStatus = availability.find((slot) => slot.time === time);
    if (slotStatus?.status === 'full') {
      setMessage('Khung giờ này đã kín. Vui lòng chọn giờ khác.');
      return;
    }

    const newBooking: Booking = {
      id: Date.now(),
      courtName: selectedCourt.name,
      date,
      time,
      duration,
      players,
      extras: EXTRA_OPTIONS.filter((extra) => selectedExtras.includes(extra.id)).map(
        (extra) => extra.label,
      ),
      note,
      totalCost: calculateTotal(),
    };

    setBookings((prev) => [newBooking, ...prev].slice(0, 4));
    setMessage('Đã giữ sân thành công! Chúng tôi sẽ liên hệ để xác nhận trong 5 phút.');
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="brand">PicklePlan</div>
        <div className="hero__content">
          <div>
            <p className="eyebrow">Đặt lịch sân pickleball tức thì</p>
            <h1>Chọn sân, chọn giờ, phần còn lại để chúng tôi lo.</h1>
            <p className="lede">
              Kiểm tra trạng thái trống, thêm huấn luyện viên, quản lý lịch chơi theo nhóm
              chỉ với vài cú nhấp. Không cần gọi điện, không phải chờ đợi.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#booking">Bắt đầu đặt sân</a>
              <span className="hero__note">Cam kết giữ sân trong 15 phút sau khi đặt.</span>
            </div>
            <div className="hero__badges">
              <div>
                <strong>+1800</strong>
                <span>lượt đặt thành công tháng này</span>
              </div>
              <div>
                <strong>4.8/5</strong>
                <span>đánh giá từ hội viên</span>
              </div>
              <div>
                <strong>12</strong>
                <span>sân đối tác trung tâm TP.HCM</span>
              </div>
            </div>
          </div>
          <div className="hero__panel">
            <p className="hero__panel-title">Ưu đãi giờ vàng</p>
            <ul>
              <li>
                <span>06:00 - 09:00</span>
                <strong>-10% cho hội viên</strong>
              </li>
              <li>
                <span>17:00 - 19:00</span>
                <strong>Combo sân + huấn luyện viên</strong>
              </li>
              <li>
                <span>Cuối tuần</span>
                <strong>Trả góp 0% cho gói 10 buổi</strong>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main className="content" id="booking">
        <section className="booking">
          <div className="section__header">
            <div>
              <p className="eyebrow">Đơn giữ sân</p>
              <h2>Điền thông tin đặt lịch</h2>
              <p className="muted">Chúng tôi sẽ xác nhận lại trong vòng vài phút.</p>
            </div>
            <div className="pill">100% hoàn tiền nếu sân không đạt chuẩn</div>
          </div>
          <div className="booking__layout">
            <form className="card form" onSubmit={handleSubmit}>
              <div className="form__row">
                <label>
                  Sân
                  <select
                    value={selectedCourtId}
                    onChange={(event) => setSelectedCourtId(event.target.value)}
                  >
                    {COURTS.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name} · {court.location}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Ngày
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
              </div>

              <div className="form__row">
                <label>
                  Khung giờ
                  <select value={time} onChange={(event) => setTime(event.target.value)}>
                    {selectedCourt.slots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                        {availabilityRules[selectedCourtId]?.includes(slot) ? ' · sắp kín' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Thời lượng
                  <select
                    value={duration}
                    onChange={(event) => setDuration(Number(event.target.value))}
                  >
                    <option value={60}>60 phút</option>
                    <option value={90}>90 phút</option>
                    <option value={120}>120 phút</option>
                  </select>
                </label>
              </div>

              <div className="form__row">
                <label>
                  Số người chơi
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={players}
                    onChange={(event) => setPlayers(Number(event.target.value))}
                  />
                </label>
                <label>
                  Ghi chú
                  <input
                    type="text"
                    placeholder="Ví dụ: Ưu tiên sân gần cổng, thêm khăn lạnh"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
              </div>

              <fieldset className="extras">
                <legend>Tiện ích thêm</legend>
                {EXTRA_OPTIONS.map((extra) => (
                  <label key={extra.id} className="extras__item">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                    />
                    <div>
                      <div className="extras__name">{extra.label}</div>
                      <div className="muted">{formatCurrency(extra.price)}</div>
                    </div>
                  </label>
                ))}
              </fieldset>

              <div className="summary">
                <div>
                  <p className="muted">Tạm tính</p>
                  <strong className="summary__price">{formatCurrency(calculateTotal())}</strong>
                  <p className="muted">Đã bao gồm phí giữ sân và thuế VAT.</p>
                </div>
                <button type="submit" className="button button--primary">
                  Giữ sân ngay
                </button>
              </div>
              {message && <div className="alert">{message}</div>}
            </form>

            <div className="stack">
              <div className="card availability">
                <div className="section__header">
                  <div>
                    <p className="eyebrow">Tình trạng</p>
                    <h3>Khả dụng trong ngày</h3>
                  </div>
                  <span className="pill pill--soft">Cập nhật mỗi 2 phút</span>
                </div>
                <ul className="availability__list">
                  {availability.map((slot) => (
                    <li key={slot.time} className={`availability__item availability__item--${slot.status}`}>
                      <div>
                        <strong>{slot.time}</strong>
                        <p className="muted">
                          {slot.status === 'full'
                            ? 'Đã kín'
                            : slot.status === 'limited'
                              ? 'Còn 1 sân'
                              : 'Còn trống'}
                        </p>
                      </div>
                      <span>
                        {slot.status === 'full' && '❌'}
                        {slot.status === 'limited' && '⏳'}
                        {slot.status === 'available' && '✅'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card bookings">
                <div className="section__header">
                  <div>
                    <p className="eyebrow">Lịch của bạn</p>
                    <h3>Đặt chỗ gần đây</h3>
                  </div>
                  <span className="pill pill--soft">Tự động nhắc giờ</span>
                </div>
                {bookings.length === 0 ? (
                  <p className="muted">Chưa có đặt chỗ nào. Hãy giữ sân đầu tiên của bạn!</p>
                ) : (
                  <ul className="bookings__list">
                    {bookings.map((booking) => (
                      <li key={booking.id}>
                        <div>
                          <strong>{booking.courtName}</strong>
                          <p className="muted">
                            {booking.date} · {booking.time} · {booking.duration} phút · {booking.players} người
                          </p>
                          {booking.extras.length > 0 && (
                            <p className="tagline">{booking.extras.join(' · ')}</p>
                          )}
                        </div>
                        <span className="summary__price">{formatCurrency(booking.totalCost)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="courts">
          <div className="section__header">
            <div>
              <p className="eyebrow">Sân nổi bật</p>
              <h2>Chọn sân phù hợp với nhóm của bạn</h2>
              <p className="muted">Đã bao gồm đèn chiếu sáng, khăn lạnh và nước lọc miễn phí.</p>
            </div>
          </div>
          <div className="courts__grid">
            {COURTS.map((court) => (
              <article key={court.id} className="card court">
                <div className="court__header">
                  <div>
                    <h3>{court.name}</h3>
                    <p className="muted">{court.location}</p>
                  </div>
                  <div className="pill">{court.indoor ? 'Trong nhà' : 'Ngoài trời'}</div>
                </div>
                <p className="tagline">Bề mặt {court.surface} · {court.amenities.join(' · ')}</p>
                <div className="court__meta">
                  <span>⭐ {court.rating}</span>
                  <span>{formatCurrency(court.pricePerHour)}/giờ</span>
                  <span>{court.slots.length} khung giờ trống</span>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    setSelectedCourtId(court.id);
                    setTime(court.slots[0]);
                    setMessage('Đã chọn sân. Hoàn tất thông tin để giữ chỗ.');
                  }}
                >
                  Chọn sân này
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <p className="eyebrow">Sẵn sàng ra sân?</p>
            <h2>Đặt lịch pickleball trong 60 giây.</h2>
            <p className="muted">Chúng tôi giữ sân miễn phí trong 15 phút và hỗ trợ hủy linh hoạt.</p>
          </div>
          <a className="button button--primary" href="#booking">
            Mở form đặt sân
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>PicklePlan · Kết nối cộng đồng pickleball Việt Nam</p>
        <p className="muted">Hỗ trợ 24/7 qua chat & hotline 1800-6868</p>
      </footer>
    </div>
  );
};

export default App;
