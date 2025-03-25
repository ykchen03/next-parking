"use client";
import { Box, AppBar, Toolbar, Typography, Card, CardActionArea, CardMedia, CardContent } from "@mui/material";

const city = [
  { en: "keelung", zh: "基隆市", img: "https://tour.klcg.gov.tw/media/klcgtour/attractions/6263832/21eb35e5-a706-4ada-baac-3278753cfea7.jpg" },
  { en: "taipei", zh: "台北市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_A12-00170_11.jpg" },
  { en: "taoyuan", zh: "桃園市", img: "https://travel.tycg.gov.tw/content/images/district/city-banner.jpg" },
  { en: "hsinchu", zh: "新竹市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_C100_408_12.jpg" },
  { en: "taichung", zh: "台中市", img: "https://travel.taichung.gov.tw/content/images/static/top-10/1-2.jpg" },
  { en: "changhua", zh: "彰化縣", img: "https://tourism.chcg.gov.tw/upload/27/2023103016473061787.jpg" },
  { en: "yunlin", zh: "雲林縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_9493_7.jpg" },
  { en: "tainan", zh: "台南市", img: "https://live.staticflickr.com/8583/15788667464_16ae4b2388_k.jpg" },
  { en: "kaohsiung", zh: "高雄市", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_9351_10.jpg" },
  { en: "pingtung", zh: "屏東縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_2112_6.jpg" },
  { en: "yilan", zh: "宜蘭縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_613_16.jpg" },
  { en: "hualien", zh: "花蓮縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_2228_12.jpg" },
  { en: "taitung", zh: "台東縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_745_14.jpg" },
  { en: "kinmen", zh: "金門縣", img: "https://www.taiwan.net.tw/att/1/big_scenic_spots/pic_C100_216_1.jpg" },
];

export default function Home() {
  return (
    <div>
      <Box className="flex">
        <AppBar position="static" color="inherit">
          <Toolbar>
            <Typography
              className="text-center grow font-bold"
              variant="h6"
              component="div"
            >
              Taiwan Parking Lot Finder
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box className="flex justify-center flex-wrap m-3">
        {city.map((item, index) => (
            <Card className="m-2 max-w-xs" key={index}>
            <CardActionArea onClick={() => window.location.href = `/${item.en}`}>
              <CardMedia
                className="w-full aspect-video object-cover"
                component="img"
                height="140"
                image={item.img}
                alt="img"
              />
              <CardContent>
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
