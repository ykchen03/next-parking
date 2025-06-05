"use client";
import { Box, Typography, Card, CardActionArea, CardMedia, CardContent } from "@mui/material";
import Header from "./components/Header";

const city = [
  {en: "assistant", zh: "停車助手", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_9351_10.jpg", enable: true},
  { en: "keelung", zh: "基隆市", img: "https://tour.klcg.gov.tw/media/klcgtour/attractions/6263832/21eb35e5-a706-4ada-baac-3278753cfea7.jpg", enable: true },
  { en: "taipei", zh: "台北市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_A12-00170_11.jpg", enable: true },
  { en: "taoyuan", zh: "桃園市", img: "https://travel.tycg.gov.tw/content/images/district/city-banner.jpg", enable: true },
  { en: "hsinchu", zh: "新竹市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_C100_408_12.jpg", enable: true },
  { en: "taichung", zh: "台中市", img: "https://travel.taichung.gov.tw/content/images/static/top-10/1-2.jpg", enable: true },
  { en: "changhua", zh: "彰化縣", img: "https://tourism.chcg.gov.tw/upload/27/2023103016473061787.jpg", enable: true },
  { en: "tainan", zh: "台南市", img: "https://live.staticflickr.com/8583/15788667464_16ae4b2388_k.jpg", enable: true },
  { en: "kaohsiung", zh: "高雄市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_9351_10.jpg", enable: true },
  { en: "pingtung", zh: "屏東縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_2112_6.jpg", enable: false },
  { en: "yilan", zh: "宜蘭縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_613_16.jpg", enable: false },
  { en: "hualien", zh: "花蓮縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_2228_12.jpg", enable: false },
  { en: "taitung", zh: "台東縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_745_14.jpg", enable: false },
  { en: "kinmen", zh: "金門縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_C100_216_1.jpg", enable: false },
];

export default function Home() {
  return (
    <div>
      <Header title="台灣停車資訊" />
      <Box className="flex justify-center flex-wrap m-3">
        {city.map((item, index) => (
          <Card className={`m-2 max-w-xs ${!item.enable ? "opacity-50" : ""}`} key={index}>
            <CardActionArea 
            disabled={!item.enable}
            onClick={() => item.enable ? window.location.href = `/${item.en}` : null}>
              <CardMedia
                className="w-full aspect-video object-cover"
                component="img"
                height="140"
                image={item.img}
                alt="img"
              />
              <CardContent className="text-center font-bold">
                <Typography gutterBottom variant="h5" component="div">
                    {item.zh}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </div>
  );
}
